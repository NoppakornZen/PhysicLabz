'use client'
import { useEffect, useRef } from 'react'
import { GRAVITY } from '@/lib/physicsEngine'

interface LabCanvasProps {
  islandId: string
  isRunning: boolean
  isPaused?: boolean
  resetKey?: number
  time: number
  u?: number
  a?: number
  height?: number
  v0?: number
  angle?: number
  friction?: number
  force?: number
  mass?: number
  mass2?: number
  onFinish?: () => void
  onStateUpdate?: (data: { s: number; v: number; t: number; vx?: number; vy?: number; fReaction?: number }) => void
}

export default function LabCanvas({
  islandId, isRunning, isPaused = false, resetKey = 0, time,
  u = 0, a = 0, height = 50, v0 = 15, angle = 45,
  friction = 0, force = 10, mass = 5, mass2 = 5,
  onFinish, onStateUpdate,
}: LabCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const physicsTimeRef = useRef<number>(0)
  const isRunningRef = useRef<boolean>(isRunning)
  const isPausedRef = useRef<boolean>(isPaused)
  const finishedRef = useRef<boolean>(false)
  const onFinishRef = useRef(onFinish)
  const onStateUpdateRef = useRef(onStateUpdate)

  useEffect(() => { onFinishRef.current = onFinish }, [onFinish])
  useEffect(() => { onStateUpdateRef.current = onStateUpdate }, [onStateUpdate])

  useEffect(() => {
    isRunningRef.current = isRunning
    if (isRunning) finishedRef.current = false
  }, [isRunning])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    physicsTimeRef.current = 0
    finishedRef.current = false
  }, [resetKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800, H = 400
    canvas.width = W
    canvas.height = H
    physicsTimeRef.current = 0
    finishedRef.current = false

    // Image loading â€” images with white backgrounds get processed once on load
    type ImgSource = HTMLImageElement | HTMLCanvasElement
    const poseToSrc: Record<string, string> = {
      idle:     '/images/mascot/front.png',
      running:  '/images/mascot/right.png',
      running_l: '/images/mascot/left.png',
      flying:   '/images/mascot/read.png',
      sad:      '/images/mascot/think.png',
      lab_h:    '/images/mascot/lab_horizontal.png',
    }
    // Mark which images need white-bg removal
    const bgRemoveSet = new Set(['/images/mascot/lab_horizontal.png'])

    const rawImages: Record<string, HTMLImageElement> = {}
    const processedImages: Record<string, HTMLCanvasElement> = {}
    const backgroundImages: Record<string, HTMLImageElement> = {}

    const processWhiteBg = (img: HTMLImageElement): HTMLCanvasElement => {
      const off = document.createElement('canvas')
      off.width = img.naturalWidth
      off.height = img.naturalHeight
      const c = off.getContext('2d')!
      c.drawImage(img, 0, 0)
      const px = c.getImageData(0, 0, off.width, off.height)
      for (let i = 0; i < px.data.length; i += 4) {
        if (px.data[i] > 230 && px.data[i + 1] > 230 && px.data[i + 2] > 230)
          px.data[i + 3] = 0
      }
      c.putImageData(px, 0, 0)
      return off
    }

    Object.entries(poseToSrc).forEach(([pose, src]) => {
      const img = new Image()
      img.onload = () => {
        if (bgRemoveSet.has(src)) processedImages[pose] = processWhiteBg(img)
      }
      img.src = src
      rawImages[pose] = img
    })

    ;['horizontal-motion', 'vertical-motion', 'projectile-motion', 'newton-1', 'newton-2', 'newton-3'].forEach(id => {
      const img = new Image()
      img.src = `/images/lab/${id}-bg.svg`
      backgroundImages[id] = img
    })

    let particleSplash: { x: number; y: number; age: number; maxAge: number; vx: number; vy: number }[] = []

    // â”€â”€ Animation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const T = () => Date.now() * 0.001

    const drawCloud = (x: number, y: number, s: number, al = 0.85) => {
      ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#fff'
      ;([[0,0,s],[-s*.85,s*.18,s*.72],[s*.85,s*.18,s*.72],[-s*.42,-s*.4,s*.62],[s*.42,-s*.4,s*.62]] as [number,number,number][])
        .forEach(([dx,dy,r]) => { ctx.beginPath(); ctx.arc(x+dx,y+dy,r,0,Math.PI*2); ctx.fill() })
      ctx.restore()
    }

    const drawTree = (x: number, gy: number, h: number) => {
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(x-h*.07, gy-h*.28, h*.14, h*.28)
      ;([[gy-h*.48,h*.37,'#1b5e20'],[gy-h*.63,h*.28,'#2e7d32'],[gy-h*.75,h*.18,'#43a047']] as [number,number,string][])
        .forEach(([cy,r,col]) => { ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,cy,r,0,Math.PI*2); ctx.fill() })
    }

    const drawWaves = (seaY: number, c1: string, c2: string) => {
      const t = T()
      ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0, seaY)
      for (let x = 0; x <= W; x += 5) ctx.lineTo(x, seaY+Math.sin(x*.028+t*1.4)*5+Math.sin(x*.016+t*.8)*3)
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()
      ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(0, seaY+10)
      for (let x = 0; x <= W; x += 5) ctx.lineTo(x, seaY+10+Math.sin(x*.035+t*1.2+1)*3)
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()
    }

    const drawMountains = (pts: number[][], color: string) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H)
      pts.forEach(([x,y]) => ctx.lineTo(x,y))
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill()
    }

    const drawBird = (x: number, y: number, span: number) => {
      ctx.beginPath()
      ctx.moveTo(x-span,y); ctx.quadraticCurveTo(x-span*.5,y-span*.35,x,y)
      ctx.quadraticCurveTo(x+span*.5,y-span*.35,x+span,y)
      ctx.stroke()
    }

    const drawGeneratedBackground = (id: string) => {
      const img = backgroundImages[id]
      if (img?.complete && img.naturalWidth > 0) ctx.drawImage(img, 0, 0, W, H)
    }

    /**
     * Draw mascot centered at feetX, feet bottom at feetY.
     * Uses natural image aspect ratio to avoid stretching.
     */
    // size = target HEIGHT â€” all poses render at the same height regardless of image dimensions
    const drawMascot = (
      c: CanvasRenderingContext2D,
      feetX: number,
      feetY: number,
      size: number,
      pose: string
    ) => {
      const img = rawImages[pose]
      if (!img?.complete || img.naturalWidth === 0) {
        c.fillStyle = '#b8855c'
        c.beginPath()
        c.arc(feetX, feetY - size / 2, size / 3, 0, Math.PI * 2)
        c.fill()
        return
      }
      const source: ImgSource = processedImages[pose] ?? img
      const w = size * (img.naturalWidth / img.naturalHeight)
      const floatY = pose === 'idle' ? Math.sin(Date.now() / 200) * 3 : 0
      c.imageSmoothingEnabled = true
      ;(c as any).imageSmoothingQuality = 'high'
      c.drawImage(source, feetX - w / 2, feetY - size + floatY, w, size)
    }

    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      isRunningRef.current = false
      onFinishRef.current?.()
    }

    const renderFrame = () => {
      ctx.clearRect(0, 0, W, H)

      let t = physicsTimeRef.current
      const isActive = isRunningRef.current && !isPausedRef.current
      if (isActive) {
        physicsTimeRef.current += 1 / 60
        t = physicsTimeRef.current
      }

      // â”€â”€â”€ HORIZONTAL MOTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (islandId === 'horizontal-motion') {
        drawGeneratedBackground('horizontal-motion')
        const skyG = ctx.createLinearGradient(0, 0, 0, 300)
        skyG.addColorStop(0, '#b3e5fc'); skyG.addColorStop(1, '#e1f5fe')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Far hills
        drawMountains([[0,280],[80,255],[180,268],[300,245],[420,260],[550,242],[680,258],[800,265]], '#c8e6c9')
        drawMountains([[0,292],[100,278],[220,285],[340,272],[480,282],[620,275],[800,288]], '#a5d6a7')

        // Sun + animated rays
        const st = T(); ctx.save(); ctx.translate(700, 60)
        for (let i = 0; i < 10; i++) {
          const a = i/10*Math.PI*2 + st*.22
          const len = 44 + Math.sin(st*2+i)*4
          ctx.strokeStyle = `rgba(255,235,59,${.15+Math.sin(st+i)*.05})`; ctx.lineWidth = 4
          ctx.beginPath(); ctx.moveTo(Math.cos(a)*32, Math.sin(a)*32); ctx.lineTo(Math.cos(a)*len, Math.sin(a)*len); ctx.stroke()
        }
        ctx.restore()
        ctx.fillStyle = '#ffb74d'; ctx.beginPath(); ctx.arc(700, 60, 30, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#ffe082'; ctx.beginPath(); ctx.arc(700, 60, 20, 0, Math.PI * 2); ctx.fill()

        // Clouds
        const ct = T()
        drawCloud(((ct*20)%(W+160))-80, 52, 30)
        drawCloud(((ct*13+300)%(W+160))-80, 88, 22, .72)
        drawCloud(((ct*8+560)%(W+160))-80, 38, 38, .6)

        ctx.fillStyle = '#4caf50'; ctx.fillRect(0, 300, W, 100)
        ctx.fillStyle = '#388e3c'; ctx.fillRect(0, 300, W, 8)

        // Trees on ground (drawn before cart so cart overlaps them naturally)
        for (const x of [55, 165, 450, 590, 720]) drawTree(x, 300, 52)
        // Distance markers
        ctx.fillStyle = '#fff'; ctx.font = '10px Nunito,sans-serif'
        for (let i = 0; i <= W; i += 50) {
          ctx.fillRect(i, 300, 2, 8)
          ctx.fillText(`${(i / 5).toFixed(0)}m`, i - 8, 320)
        }

        let s = u * t + 0.5 * a * t * t
        let v = u + a * t
        if (a < 0 && v <= 0 && u > 0) { v = 0; s = -u * u / (2 * a); finish() }

        let cx = 100 + s * 5
        if (cx >= W - 60) { cx = W - 60; finish() }

        // Cart
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(cx - 35, 275, 70, 10)
        ctx.fillStyle = '#37474f'
        ctx.beginPath(); ctx.arc(cx - 20, 290, 8, 0, Math.PI * 2); ctx.arc(cx + 20, 290, 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#cfd8dc'
        ctx.beginPath(); ctx.arc(cx - 20, 290, 3, 0, Math.PI * 2); ctx.arc(cx + 20, 290, 3, 0, Math.PI * 2); ctx.fill()

        // Telemetry
        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`t: ${t.toFixed(2)} s`, 20, 30)
        ctx.fillText(`s: ${s.toFixed(2)} m`, 20, 50)
        ctx.fillText(`v: ${v.toFixed(2)} m/s`, 20, 70)

        // Speed lines (draw BEFORE mascot)
        if (isActive && Math.abs(v) > 0.1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(cx - 65, 248); ctx.lineTo(cx - 50, 248)
          ctx.moveTo(cx - 60, 260); ctx.lineTo(cx - 47, 260)
          ctx.stroke()
        }

        // Mascot ON cart (feet at cart top y=275)
        const pose = isRunningRef.current ? (islandId === 'horizontal-motion' && rawImages.lab_h?.complete ? 'lab_h' : 'running') : 'idle'
        drawMascot(ctx, cx, 275, 80, pose)

        onStateUpdateRef.current?.({ s, v, t })

      // â”€â”€â”€ VERTICAL MOTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      } else if (islandId === 'vertical-motion') {
        drawGeneratedBackground('vertical-motion')
        const skyG = ctx.createLinearGradient(0, 0, 0, 400)
        skyG.addColorStop(0, '#e3f2fd'); skyG.addColorStop(0.5, '#bbdefb'); skyG.addColorStop(1, '#90caf9')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Background city silhouette
        ctx.fillStyle = '#b0bec5'
        for (const [bx,by,bw,bh] of [[200,260,40,110],[260,240,35,130],[310,255,30,115],[360,230,50,140],[430,248,38,122],[490,260,32,110],[540,238,44,132]] as number[][])
          ctx.fillRect(bx,by,bw,bh)
        // Windows on city buildings
        const wt = T(); ctx.fillStyle = '#fff9c4'
        for (let bi = 0; bi < 14; bi++) {
          const wx = 205+bi*44, wy = 265+(bi%3)*18
          if (Math.sin(wt*1.5+bi*2.3) > -.3) { ctx.globalAlpha = .6+Math.sin(wt+bi)*.3; ctx.fillRect(wx,wy,8,10); ctx.globalAlpha=1 }
        }

        // Clouds
        const ct = T()
        drawCloud(((ct*14)%(W+160))-80, 45, 28)
        drawCloud(((ct*9+340)%(W+160))-80, 75, 20, .7)

        // Birds
        ctx.strokeStyle = '#37474f'; ctx.lineWidth = 2
        for (const [bx,by,bs,bp] of [[400,90,12,0],[500,70,9,1.5],[600,100,11,3]] as number[][])
          drawBird(bx+Math.sin(wt*.8+bp)*30, by+Math.sin(wt*.5+bp)*8, bs)

        // Main building
        ctx.fillStyle = '#78909c'; ctx.fillRect(0, 150, 120, 250)
        ctx.fillStyle = '#546e7a'; ctx.fillRect(0, 150, 120, 8)
        // Building windows
        ctx.fillStyle = '#fff9c4'
        for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
          const on = Math.sin(T()*0.8 + row*1.1 + col*2.3) > 0
          ctx.globalAlpha = on ? .85 : .2
          ctx.fillRect(12+col*32, 165+row*26, 18, 16)
        }
        ctx.globalAlpha = 1

        // Sea with waves
        drawWaves(370, '#1e88e5', '#1565c0')

        const seaY = 370
        let currentH = height + u * t - 0.5 * GRAVITY * t * t
        let vy = u - GRAVITY * t
        let currentY = seaY - currentH * 4.4

        if (currentH <= 0) {
          currentH = 0; currentY = seaY
          if (particleSplash.length === 0) {
            for (let i = 0; i < 15; i++)
              particleSplash.push({ x: 180, y: seaY, age: 0, maxAge: 30 + Math.random() * 20, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 5 - 2 })
          }
          finish()
        }

        particleSplash.forEach(p => {
          ctx.fillStyle = '#fff'; ctx.beginPath()
          ctx.arc(p.x, p.y, 4 * (1 - p.age / p.maxAge), 0, Math.PI * 2); ctx.fill()
          p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.age++
        })
        particleSplash = particleSplash.filter(p => p.age < p.maxAge)

        // Height dashed line (before mascot)
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5])
        ctx.beginPath(); ctx.moveTo(180, currentY); ctx.lineTo(180, seaY); ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`t: ${t.toFixed(2)} s`, 250, 30)
        ctx.fillText(`y: ${currentH.toFixed(2)} m`, 250, 50)
        ctx.fillText(`v: ${vy.toFixed(2)} m/s`, 250, 70)

        // Mascot feet at currentY
        drawMascot(ctx, 180, currentY, 80, currentH <= 0 ? 'sad' : (vy > 0 ? 'flying' : 'idle'))

        onStateUpdateRef.current?.({ s: currentH, v: vy, t })

      // â”€â”€â”€ PROJECTILE MOTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      } else if (islandId === 'projectile-motion') {
        drawGeneratedBackground('projectile-motion')
        const skyG = ctx.createLinearGradient(0, 0, 0, 400)
        skyG.addColorStop(0, '#fff9c4'); skyG.addColorStop(0.6, '#e0f7fa'); skyG.addColorStop(1, '#80deea')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Distant mountains
        drawMountains([[120,300],[200,220],[280,265],[380,200],[480,240],[580,195],[680,235],[800,265]], '#b0bec5')
        drawMountains([[120,300],[240,250],[360,230],[500,255],[650,235],[800,280]], '#90a4ae')

        // Clouds
        const ct = T()
        drawCloud(((ct*16)%(W+160))-80, 45, 28)
        drawCloud(((ct*10+350)%(W+160))-80, 70, 20, .7)

        // Birds
        ctx.strokeStyle = '#455a64'; ctx.lineWidth = 1.5
        for (const [bx,by,bs,bp] of [[350,60,10,0],[480,85,8,2],[580,55,11,4]] as number[][])
          drawBird(bx+Math.sin(ct*.7+bp)*25, by, bs)

        // Sea with waves (replacing flat fill)
        drawWaves(340, '#1565c0', '#0d47a1')

        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 260, 120, 80)
        ctx.fillStyle = '#4caf50'; ctx.fillRect(0, 260, 120, 8)

        const pivotX = 80, pivotY = 250
        const angleRad = (angle * Math.PI) / 180
        const vx = v0 * Math.cos(angleRad)
        const vy0 = v0 * Math.sin(angleRad)
        const sX = vx * t
        const sY = vy0 * t - 0.5 * GRAVITY * t * t
        const vy = vy0 - GRAVITY * t
        const scale = 4.8

        let cx = pivotX + sX * scale
        let cy = pivotY - sY * scale

        if (cy >= 340) {
          cy = 340
          if (particleSplash.length === 0) {
            for (let i = 0; i < 15; i++)
              particleSplash.push({ x: cx, y: 340, age: 0, maxAge: 35 + Math.random() * 15, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 6 - 2 })
          }
          finish()
        }

        particleSplash.forEach(p => {
          ctx.fillStyle = '#fff'; ctx.beginPath()
          ctx.arc(p.x, p.y, 4 * (1 - p.age / p.maxAge), 0, Math.PI * 2); ctx.fill()
          p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.age++
        })
        particleSplash = particleSplash.filter(p => p.age < p.maxAge)

        // Trajectory (before mascot)
        ctx.strokeStyle = 'rgba(38,50,56,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(pivotX, pivotY)
        const flightTime = Math.min((2 * vy0) / GRAVITY, 15)
        for (let pt = 0; pt <= flightTime; pt += 0.1) {
          const px = pivotX + (vx * pt) * scale
          const py = pivotY - (vy0 * pt - 0.5 * GRAVITY * pt * pt) * scale
          if (py > 340) break
          ctx.lineTo(px, py)
        }
        ctx.stroke(); ctx.setLineDash([])

        // Cannon
        ctx.save(); ctx.translate(pivotX, pivotY); ctx.rotate(-angleRad)
        ctx.fillStyle = '#455a64'; ctx.fillRect(-10, -12, 35, 24)
        ctx.fillStyle = '#37474f'; ctx.fillRect(20, -14, 6, 28)
        ctx.restore()
        ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.arc(pivotX, pivotY + 10, 12, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`t: ${t.toFixed(2)} s`, 250, 30)
        ctx.fillText(`x: ${sX.toFixed(2)} m`, 250, 50)
        ctx.fillText(`y: ${sY.toFixed(2)} m`, 250, 70)
        ctx.fillText(`v: ${Math.sqrt(vx * vx + vy * vy).toFixed(2)} m/s`, 250, 90)

        // Mascot feet at cy (projectile position)
        drawMascot(ctx, cx, cy, 70, isRunningRef.current ? 'flying' : 'idle')

        onStateUpdateRef.current?.({ s: sX, v: Math.sqrt(vx * vx + vy * vy), t, vx, vy })

      // â”€â”€â”€ NEWTON 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      } else if (islandId === 'newton-1') {
        drawGeneratedBackground('newton-1')
        const isIce = friction === 0
        const skyG = ctx.createLinearGradient(0, 0, 0, 300)
        skyG.addColorStop(0, isIce ? '#e0f7fa' : '#dcedc8')
        skyG.addColorStop(1, isIce ? '#b3e5fc' : '#aed581')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Background terrain
        if (isIce) {
          drawMountains([[0,280],[100,220],[200,245],[340,200],[460,230],[600,210],[800,260]], '#e0f2f1')
          drawMountains([[0,295],[150,260],[280,275],[420,255],[580,268],[800,280]], '#b2dfdb')
          // Sparkles on ice ground
          const st = T()
          ctx.fillStyle = '#e0f7fa'
          for (let i = 0; i < 12; i++) {
            const sx = 60+i*60, sy = 305+Math.sin(i*1.3)*4
            const alpha = .4+Math.sin(st*3+i*1.7)*.4
            ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(sx,sy,2,0,Math.PI*2); ctx.fill()
          }
          ctx.globalAlpha = 1
        } else {
          drawMountains([[0,275],[90,240],[200,258],[320,228],[460,248],[600,230],[800,262]], '#c5e1a5')
          for (const x of [60,180,360,540,680]) drawTree(x, 300, 55)
          const ct = T()
          drawCloud(((ct*14)%(W+160))-80, 55, 28); drawCloud(((ct*9+350)%(W+160))-80, 78, 20, .7)
        }

        ctx.fillStyle = isIce ? '#e0f7fa' : '#8d6e63'; ctx.fillRect(0, 300, W, 100)
        ctx.fillStyle = isIce ? '#b2ebf2' : '#4caf50'; ctx.fillRect(0, 300, W, 8)

        const aDecel = friction === 0 ? 0 : -friction * GRAVITY
        let s = u * t + 0.5 * aDecel * t * t
        let v = u + aDecel * t
        if (friction > 0 && v <= 0 && u > 0) { v = 0; s = -u * u / (2 * aDecel); finish() }

        let cx = 100 + s * 10
        if (cx >= W - 60) { cx = W - 60; finish() }

        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`t: ${t.toFixed(2)} s`, 20, 30)
        ctx.fillText(`v: ${v.toFixed(2)} m/s`, 20, 50)
        ctx.fillText(`a: ${aDecel.toFixed(2)} m/sÂ²`, 20, 70)

        // lab_horizontal.png â€” feetY=303 à¹€à¸œà¸·à¹ˆà¸­ padding à¹ƒà¸•à¹‰à¸£à¸¹à¸›
        drawMascot(ctx, cx, 303, 140, 'lab_h')

        onStateUpdateRef.current?.({ s, v, t })

      // â”€â”€â”€ NEWTON 2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      } else if (islandId === 'newton-2') {
        drawGeneratedBackground('newton-2')
        const skyG = ctx.createLinearGradient(0, 0, 0, 300)
        skyG.addColorStop(0, '#f3e5f5'); skyG.addColorStop(1, '#e1bee7')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Factory/warehouse background
        ctx.fillStyle = '#9e9e9e'
        for (const [bx,bw,bh] of [[0,90,200],[100,70,180],[200,110,220],[340,80,170],[450,100,210],[580,90,185],[700,100,200]] as number[][])
          ctx.fillRect(bx, 300-bh, bw, bh)
        ctx.fillStyle = '#757575'
        for (const [bx,bw,bh] of [[0,90,200],[200,110,220],[450,100,210],[700,100,200]] as number[][]) {
          ctx.fillRect(bx, 300-bh, bw, 6) // roof edge
        }
        // Factory windows
        ctx.fillStyle = '#fff9c4'
        const ft = T()
        for (let i = 0; i < 8; i++) {
          const wx = 10+i*98, wy = 170+Math.sin(i)*20
          ctx.globalAlpha = .5+Math.sin(ft*.6+i*1.8)*.3
          ctx.fillRect(wx,wy,22,18)
        }
        ctx.globalAlpha = 1

        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 300, W, 100)
        ctx.fillStyle = '#ffb74d'; ctx.fillRect(0, 300, W, 8)

        const aN = force / mass
        const s = 0.5 * aN * t * t
        const v = aN * t
        let cx = 150 + s * 6
        if (cx >= W - 80) { cx = W - 80; finish() }

        const boxSize = 35 + mass * 2
        const boxTop = 300 - boxSize
        const boxLeft = cx - boxSize / 2

        // Force arrow (draw BEFORE mascot)
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 4; ctx.fillStyle = '#4caf50'
        ctx.beginPath()
        ctx.moveTo(boxLeft - 80, 300 - boxSize / 2)
        ctx.lineTo(boxLeft - 5, 300 - boxSize / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(boxLeft - 5, 300 - boxSize / 2)
        ctx.lineTo(boxLeft - 15, 300 - boxSize / 2 - 6)
        ctx.lineTo(boxLeft - 15, 300 - boxSize / 2 + 6)
        ctx.fill()
        ctx.font = 'bold 12px Nunito,sans-serif'
        ctx.fillText(`${force.toFixed(0)} N`, boxLeft - 78, 300 - boxSize / 2 - 10)

        // Box (draw BEFORE mascot)
        ctx.fillStyle = '#a1887f'
        ctx.fillRect(boxLeft, boxTop, boxSize, boxSize)
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2
        ctx.strokeRect(boxLeft, boxTop, boxSize, boxSize)
        ctx.beginPath()
        ctx.moveTo(boxLeft, boxTop); ctx.lineTo(cx + boxSize / 2, 300)
        ctx.moveTo(cx + boxSize / 2, boxTop); ctx.lineTo(boxLeft, 300)
        ctx.stroke()

        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`F: ${force.toFixed(1)} N`, 20, 30)
        ctx.fillText(`m: ${mass.toFixed(1)} kg`, 20, 50)
        ctx.fillText(`a: ${aN.toFixed(2)} m/sÂ²`, 20, 70)
        ctx.fillText(`v: ${v.toFixed(2)} m/s`, 20, 90)

        // Mascot beside box, feet on ground (y=300)
        drawMascot(ctx, boxLeft - 45, 300, 80, isRunningRef.current ? 'running' : 'idle')

        onStateUpdateRef.current?.({ s, v, t })

      // â”€â”€â”€ NEWTON 3 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      } else if (islandId === 'newton-3') {
        drawGeneratedBackground('newton-3')
        const skyG = ctx.createLinearGradient(0, 0, 0, 300)
        skyG.addColorStop(0, '#e8eaf6'); skyG.addColorStop(1, '#c5cae9')
        ctx.globalAlpha = 0.18; ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

        // Arena walls
        ctx.fillStyle = '#bcaaa4'
        ctx.fillRect(0, 180, W, 120) // back wall
        ctx.fillStyle = '#a1887f'; ctx.fillRect(0, 180, W, 8) // wall top
        // Arena crowd silhouettes
        ctx.fillStyle = '#8d6e63'
        for (let i = 0; i < 20; i++) {
          const hx = 18+i*40, hy = 168
          ctx.beginPath(); ctx.arc(hx, hy, 9, Math.PI, 0); ctx.fill()
          ctx.fillRect(hx-9, hy, 18, 14)
        }
        ctx.fillStyle = '#795548'
        for (let i = 0; i < 22; i++) {
          const hx = 6+i*36, hy = 148
          ctx.beginPath(); ctx.arc(hx, hy, 7, Math.PI, 0); ctx.fill()
          ctx.fillRect(hx-7, hy, 14, 12)
        }
        // Arena floor
        ctx.fillStyle = '#9e9e9e'; ctx.fillRect(0, 300, W, 100)
        ctx.fillStyle = '#7986cb'; ctx.fillRect(0, 300, W, 8)
        // Center line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.setLineDash([8,8])
        ctx.beginPath(); ctx.moveTo(400,300); ctx.lineTo(400,400); ctx.stroke()
        ctx.setLineDash([])

        const a1 = -force / mass, a2 = force / mass2
        const s1 = 0.5 * a1 * t * t, s2 = 0.5 * a2 * t * t
        const v1 = a1 * t, v2 = a2 * t
        let x1 = 400 + s1 * 8, x2 = 400 + s2 * 8

        if (x1 <= 60 || x2 >= W - 60) finish()

        // Force vectors (draw BEFORE carts and mascots)
        ctx.strokeStyle = '#e53935'; ctx.lineWidth = 4; ctx.fillStyle = '#e53935'
        ctx.beginPath(); ctx.moveTo(x1 + 20, 240); ctx.lineTo(x1 + 70, 240); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1 + 70, 240); ctx.lineTo(x1 + 62, 234); ctx.lineTo(x1 + 62, 246)
        ctx.fill()

        ctx.strokeStyle = '#1e88e5'; ctx.fillStyle = '#1e88e5'
        ctx.beginPath(); ctx.moveTo(x2 - 20, 240); ctx.lineTo(x2 - 70, 240); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x2 - 70, 240); ctx.lineTo(x2 - 62, 234); ctx.lineTo(x2 - 62, 246)
        ctx.fill()

        ctx.fillStyle = '#263238'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.fillText(`Nuto 1: m=${mass}kg, v=${v1.toFixed(2)} m/s`, 20, 30)
        ctx.fillText(`Nuto 2: m=${mass2}kg, v=${v2.toFixed(2)} m/s`, 20, 50)
        ctx.fillText(`Action = âˆ’Reaction = ${force.toFixed(0)} N`, 20, 70)

        // Left cart + mascot
        ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x1 - 35, 275, 70, 10)
        ctx.fillStyle = '#37474f'
        ctx.beginPath(); ctx.arc(x1 - 20, 290, 8, 0, Math.PI * 2); ctx.arc(x1 + 20, 290, 8, 0, Math.PI * 2); ctx.fill()
        // Mascot 1 faces right, feet at cart top y=275
        drawMascot(ctx, x1, 275, 80, isRunningRef.current ? 'running' : 'idle')

        // Right cart + mascot (use running_l / left.png â€” no flip needed)
        ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x2 - 35, 275, 70, 10)
        ctx.fillStyle = '#37474f'
        ctx.beginPath(); ctx.arc(x2 - 20, 290, 8, 0, Math.PI * 2); ctx.arc(x2 + 20, 290, 8, 0, Math.PI * 2); ctx.fill()
        // Mascot 2 faces left using left.png â€” feet at cart top y=275
        drawMascot(ctx, x2, 275, 80, isRunningRef.current ? 'running_l' : 'idle')

        onStateUpdateRef.current?.({ s: x2 - x1, v: v2 - v1, t, fReaction: -force })
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame)
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame)
    return () => { if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandId, u, a, height, v0, angle, friction, force, mass, mass2])

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', border: '3px solid #37474f' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '800/400', background: '#eceff1' }}
      />
    </div>
  )
}
