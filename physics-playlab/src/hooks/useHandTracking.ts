'use client'
import { useEffect, useRef, useState } from 'react'
import { recognizeGesture } from '@/lib/handPhysics/gestures'
import type { Landmark } from '@/lib/handPhysics/gestures'
import { getDevicePerformanceProfile } from '@/lib/deviceCapability'

export interface HandState {
  grabPointWorld: { x: number; y: number } | null
  grabPointNormalized: { x: number; y: number } | null
  velocity: { x: number; y: number }
  isGrabbing: boolean
  confidence: number
  hasHand: boolean
  handOpenness: number
}

const INITIAL_HAND_STATE: HandState = {
  grabPointWorld: null,
  grabPointNormalized: null,
  velocity: { x: 0, y: 0 },
  isGrabbing: false,
  confidence: 0,
  hasHand: false,
  handOpenness: 0,
}

interface HandTrackingResults {
  multiHandLandmarks?: Landmark[][]
  multiHandedness?: Array<{ score?: number }>
}

interface MediaPipeHandsInstance {
  setOptions(options: Record<string, number>): void
  onResults(callback: (results: HandTrackingResults) => void): void
  send(input: { image: HTMLVideoElement }): Promise<void>
  close?: () => void
}

type MediaPipeHandsConstructor = new (options: {
  locateFile: (file: string) => string
}) => MediaPipeHandsInstance

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'ไม่ได้รับสิทธิ์ใช้กล้อง — ยังทดลองต่อด้วยเมาส์หรือการสัมผัสได้'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'ไม่พบกล้อง — ยังทดลองต่อด้วยเมาส์หรือการสัมผัสได้'
  }
  return 'เปิด Hand Tracking ไม่สำเร็จ — ยังทดลองต่อด้วยเมาส์หรือการสัมผัสได้'
}

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null)
  const handStateRef = useRef<HandState>(INITIAL_HAND_STATE)
  const [handState, setHandState] = useState<HandState>(INITIAL_HAND_STATE)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Hysteresis: track whether last frame was grabbing so gestures.ts
  // applies the wider GRAB_OFF release threshold instead of GRAB_ON.
  const wasGrabbingRef = useRef(false)

  // Rolling position history for smooth throw velocity (avoids single-frame noise).
  const posHistoryRef = useRef<Array<{ x: number; y: number; t: number }>>([])

  useEffect(() => {
    const profile = getDevicePerformanceProfile()
    let cameraInstance: { start(): Promise<void>; stop(): void } | null = null
    let handsInstance: MediaPipeHandsInstance | null = null
    let isMounted = true
    let sourceFrameCount = 0
    let inferenceInFlight = false

    function loadScript(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement & { __loaded?: boolean }>(`script[src="${src}"]`)
        if (existing) {
          // Script tag exists but may not have executed yet — wait for it.
          if (existing.__loaded) { resolve(); return }
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
          return
        }
        const s = document.createElement('script') as HTMLScriptElement & { __loaded?: boolean }
        s.src = src
        s.crossOrigin = 'anonymous'
        s.onload = () => { s.__loaded = true; resolve() }
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(s)
      })
    }

    class CameraUtil {
      private stream: MediaStream | undefined
      private lastTime = 0
      private rafId = 0
      constructor(
        private video: HTMLVideoElement,
        private opts: { onFrame: () => Promise<void>; width: number; height: number }
      ) {}
      async start() {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: this.opts.width, height: this.opts.height },
        })
        this.video.srcObject = this.stream
        await new Promise<void>(res => { this.video.onloadedmetadata = () => res() })
        await this.video.play()
        this.loop()
      }
      private loop() {
        this.rafId = requestAnimationFrame(async () => {
          if (!this.video.paused && this.video.currentTime !== this.lastTime) {
            this.lastTime = this.video.currentTime
            await this.opts.onFrame()
          }
          this.loop()
        })
      }
      stop() {
        cancelAnimationFrame(this.rafId)
        this.stream?.getTracks().forEach(t => t.stop())
        this.video.srcObject = null
      }
    }

    async function init() {
      try {
        // Load from /public/mediapipe — same origin, no webpack bundling, no CORS.
        await loadScript('/mediapipe/hands/hands.js')
        const Hands = (window as Window & { Hands?: MediaPipeHandsConstructor }).Hands
        if (typeof Hands !== 'function') {
          throw new Error(`MediaPipe not ready: Hands=${typeof Hands}`)
        }

        if (!videoRef.current || !isMounted) return

        const hands = new Hands({
          locateFile: (file: string) =>
            `/mediapipe/hands/${file}`,
        })
        handsInstance = hands

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.3,
        })

        hands.onResults((results) => {
          if (!isMounted) return
          drawSkeleton(results)

          const landmarks = results.multiHandLandmarks?.[0]
          if (landmarks) {
            const confidence = results.multiHandedness?.[0]?.score ?? 0

            // Pass wasGrabbing so gestures.ts uses the wider GRAB_OFF threshold
            const gesture = recognizeGesture(landmarks, confidence, wasGrabbingRef.current)
            wasGrabbingRef.current = gesture.isGrabbing

            if (gesture.grabPointNormalized) {
              const now = performance.now()
              const worldX = (1 - gesture.grabPointNormalized.x) * 10 - 5
              const worldY = (1 - gesture.grabPointNormalized.y) * 8 - 4

              // Push to rolling window, keep last 3 samples (tighter window = less lag on throw)
              posHistoryRef.current.push({ x: worldX, y: worldY, t: now })
              if (posHistoryRef.current.length > 3) posHistoryRef.current.shift()

              // Velocity from oldest→newest in the window to smooth out noise
              let vx = 0
              let vy = 0
              const hist = posHistoryRef.current
              if (hist.length >= 2) {
                const oldest = hist[0]
                const newest = hist[hist.length - 1]
                const dt = (newest.t - oldest.t) / 1000
                if (dt > 0) {
                  vx = (newest.x - oldest.x) / dt
                  vy = (newest.y - oldest.y) / dt
                  vx = Math.max(-20, Math.min(20, vx))
                  vy = Math.max(-20, Math.min(20, vy))
                }
              }

              const next: HandState = {
                grabPointWorld: { x: worldX, y: worldY },
                grabPointNormalized: gesture.grabPointNormalized,
                velocity: { x: vx, y: vy },
                isGrabbing: gesture.isGrabbing,
                confidence,
                hasHand: true,
                handOpenness: gesture.handOpenness,
              }
              handStateRef.current = next
              setHandState(next)
            }
          } else {
            posHistoryRef.current = []
            wasGrabbingRef.current = false
            if (handStateRef.current.hasHand) {
              const next = { ...INITIAL_HAND_STATE }
              handStateRef.current = next
              setHandState(next)
            }
          }
        })

        cameraInstance = new CameraUtil(videoRef.current, {
          onFrame: async () => {
            if (!videoRef.current) return
            sourceFrameCount++
            if (sourceFrameCount % profile.inferenceFrameInterval !== 0 || inferenceInFlight) return
            inferenceInFlight = true
            try {
              await hands.send({ image: videoRef.current })
            } finally {
              inferenceInFlight = false
            }
          },
          width: profile.cameraWidth,
          height: profile.cameraHeight,
        })

        await cameraInstance.start()
        if (isMounted) {
          setCameraError(null)
          setCameraReady(true)
        }
      } catch (err) {
        console.error('Hand tracking init failed:', err)
        if (isMounted) {
          setCameraReady(false)
          setCameraError(cameraErrorMessage(err))
        }
      }
    }

    function drawSkeleton(results: HandTrackingResults) {
      const canvas = skeletonCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dw = canvas.clientWidth || 640
      const dh = canvas.clientHeight || 480
      if (canvas.width !== dw || canvas.height !== dh) {
        canvas.width = dw
        canvas.height = dh
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!results.multiHandLandmarks?.length) return

      const landmarks = results.multiHandLandmarks[0]
      const w = canvas.width
      const h = canvas.height

      const connections: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ]

      const grabbing = wasGrabbingRef.current
      ctx.lineWidth = grabbing ? 3 : 2.25
      ctx.strokeStyle = grabbing ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 229, 255, 0.75)'
      ctx.shadowColor = grabbing ? 'rgba(0, 229, 255, 0.65)' : 'rgba(0, 229, 255, 0.35)'
      ctx.shadowBlur = grabbing ? 10 : 6
      for (const [a, b] of connections) {
        const la = landmarks[a]
        const lb = landmarks[b]
        ctx.beginPath()
        ctx.moveTo(la.x * w, la.y * h)
        ctx.lineTo(lb.x * w, lb.y * h)
        ctx.stroke()
      }

      ctx.shadowBlur = 0
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i]
        const isTip = i === 4 || i === 8
        ctx.beginPath()
        ctx.arc(lm.x * w, lm.y * h, isTip ? 5 : 3.2, 0, Math.PI * 2)
        ctx.fillStyle = isTip
          ? (grabbing ? 'rgba(255,255,255,0.95)' : 'rgba(122, 248, 255, 0.95)')
          : 'rgba(0, 229, 255, 0.9)'
        ctx.fill()
      }
    }

    init()

    return () => {
      isMounted = false
      cameraInstance?.stop()
      handsInstance?.close?.()
    }
  }, [])

  return { videoRef, skeletonCanvasRef, handState, handStateRef, cameraReady, cameraError }
}
