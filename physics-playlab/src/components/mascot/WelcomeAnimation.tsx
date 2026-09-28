'use client'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { AUTH } from '@/data/translations/auth'
import styles from './WelcomeAnimation.module.css'

const TOTAL_FRAMES = 20
const FPS = 12

interface WelcomeAnimationProps {
  name: string
  onDone: () => void
}

export default function WelcomeAnimation({ name, onDone }: WelcomeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lang = useLanguage()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = 360
    canvas.width = SIZE
    canvas.height = SIZE

    const frames: HTMLCanvasElement[] = []
    let loaded = 0

    const removeBg = (img: HTMLImageElement): HTMLCanvasElement => {
      const off = document.createElement('canvas')
      off.width = img.naturalWidth
      off.height = img.naturalHeight
      const c = off.getContext('2d')
      if (!c) return off
      c.drawImage(img, 0, 0)
      const W = off.width, H = off.height
      let px: ImageData
      try {
        px = c.getImageData(0, 0, W, H)
      } catch {
        return off
      }
      const d = px.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2]
        // Skip dark pixels and pixels with too-low blue (red tie, dark browns)
        if (r < 130 || b < 80) continue
        // Convert to HSL to detect hot-pink / magenta hue (290–360°)
        const rn = r / 255, gn = g / 255, bn = b / 255
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
        const delta = max - min
        if (delta < 0.25) continue          // low saturation → not pink (whites, skin, gray)
        const l = (max + min) / 2
        if (l < 0.30 || l > 0.95) continue  // too dark or too light → skip
        // Compute hue
        let h = max === rn ? (gn - bn) / delta + (gn < bn ? 6 : 0)
               : max === gn ? (bn - rn) / delta + 2
               : (rn - gn) / delta + 4
        h *= 60
        // Pink / magenta range: 290–360°
        if (h >= 290) {
          d[i + 3] = 0
        }
      }
      c.putImageData(px, 0, 0)
      return off
    }

    for (let f = 1; f <= TOTAL_FRAMES; f++) {
      const img = new Image()
      const num = String(f).padStart(3, '0')
      img.src = `/images/mascot/anim-welcome/ezgif-frame-${num}.png`
      const idx = f - 1
      img.onload = () => {
        frames[idx] = removeBg(img)
        loaded++
        if (loaded === TOTAL_FRAMES) startAnim()
      }
      img.onerror = () => {
        frames[idx] = document.createElement('canvas')
        loaded++
        if (loaded === TOTAL_FRAMES) startAnim()
      }
    }

    let frameIdx = 0
    let rafId: number
    let lastTime = 0
    const interval = 1000 / FPS

    const startAnim = () => {
      const tick = (now: number) => {
        if (now - lastTime >= interval) {
          ctx.clearRect(0, 0, SIZE, SIZE)
          const frame = frames[frameIdx]
          if (frame) {
            const ratio = frame.width / frame.height
            const drawW = ratio >= 1 ? SIZE : SIZE * ratio
            const drawH = ratio >= 1 ? SIZE / ratio : SIZE
            ctx.drawImage(frame, (SIZE - drawW) / 2, (SIZE - drawH) / 2, drawW, drawH)
          }
          lastTime = now
          frameIdx++
          if (frameIdx >= TOTAL_FRAMES) {
            setTimeout(onDone, 300)
            return
          }
        }
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [onDone])

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <canvas ref={canvasRef} className={styles.canvas} width={360} height={360} />
        <p className={styles.welcome}>{t('auth.welcomeAnimation.welcome', AUTH, lang)} <span>{name}</span>!</p>
        <p className={styles.sub}>{t('auth.welcomeAnimation.sub', AUTH, lang)}</p>
      </div>
    </div>
  )
}
