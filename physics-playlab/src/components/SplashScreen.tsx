'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './SplashScreen.module.css'

const TOTAL = 20
const FPS = 15

export default function SplashScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [show, setShow] = useState(false)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('splash_done')) return
    sessionStorage.setItem('splash_done', '1')
    setShow(true)
  }, [])

  useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = 420
    canvas.width = SIZE
    canvas.height = SIZE

    const removeBg = (img: HTMLImageElement): HTMLCanvasElement => {
      const off = document.createElement('canvas')
      off.width = img.naturalWidth
      off.height = img.naturalHeight
      const c = off.getContext('2d')
      if (!c) return off
      c.drawImage(img, 0, 0)
      let px: ImageData
      try { px = c.getImageData(0, 0, off.width, off.height) } catch { return off }
      const d = px.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2]
        if (r < 130 || b < 80) continue
        const rn = r / 255, gn = g / 255, bn = b / 255
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
        const delta = max - min
        if (delta < 0.25) continue
        const l = (max + min) / 2
        if (l < 0.30 || l > 0.95) continue
        let h = max === rn ? (gn - bn) / delta + (gn < bn ? 6 : 0)
               : max === gn ? (bn - rn) / delta + 2
               : (rn - gn) / delta + 4
        h *= 60
        if (h >= 290) d[i + 3] = 0
      }
      c.putImageData(px, 0, 0)
      return off
    }

    const frames: HTMLCanvasElement[] = []
    let loaded = 0
    let rafId: number

    const play = () => {
      let fi = 0, last = 0
      const ms = 1000 / FPS
      const tick = (now: number) => {
        if (now - last >= ms) {
          ctx.clearRect(0, 0, SIZE, SIZE)
          const f = frames[fi]
          if (f) {
            const ratio = f.width / f.height
            const w = ratio >= 1 ? SIZE : SIZE * ratio
            const h = ratio >= 1 ? SIZE / ratio : SIZE
            ctx.drawImage(f, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
          }
          last = now
          fi++
          if (fi >= TOTAL) {
            setFade(true)
            setTimeout(() => setShow(false), 650)
            return
          }
        }
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    for (let f = 1; f <= TOTAL; f++) {
      const img = new Image()
      img.src = `/images/mascot/anim-start/ezgif-frame-${String(f).padStart(3, '0')}.png`
      const idx = f - 1
      img.onload = () => { frames[idx] = removeBg(img); if (++loaded === TOTAL) play() }
      img.onerror = () => { frames[idx] = document.createElement('canvas'); if (++loaded === TOTAL) play() }
    }

    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [show])

  if (!show) return null

  return (
    <div className={`${styles.overlay} ${fade ? styles.fade : ''}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.title}>Physics PlayLab</p>
      <p className={styles.sub}>กำลังโหลด...</p>
    </div>
  )
}
