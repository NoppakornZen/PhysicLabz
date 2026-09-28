'use client'
import { useEffect, useRef } from 'react'

export default function LobbyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.innerWidth < 1024

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    type Particle = {
      x: number; y: number; vx: number; vy: number
      size: number; life: number; maxLife: number; color: string
    }

    const particles: Particle[] = []
    const COLORS = [
      'rgba(60,210,170,',
      'rgba(100,200,255,',
      'rgba(200,150,255,',
      'rgba(255,220,100,',
      'rgba(140,255,200,',
    ]

    function spawn() {
      const maxLife = 130 + Math.random() * 180
      particles.push({
        x: Math.random() * canvas!.width,
        y: canvas!.height * 0.45 + Math.random() * canvas!.height * 0.55,
        vx: (Math.random() - 0.5) * 0.55,
        vy: -(0.25 + Math.random() * 0.9),
        size: 0.8 + Math.random() * 2.4,
        life: maxLife,
        maxLife,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    // pre-seed — fewer particles on mobile
    const SEED = isMobile ? 25 : 60
    for (let i = 0; i < SEED; i++) {
      spawn()
      const p = particles[particles.length - 1]
      p.life = Math.random() * p.maxLife
    }

    let frame = 0
    let animId: number

    function tick() {
      animId = requestAnimationFrame(tick)
      frame++
      if (!canvas || !ctx) return

      // On mobile: skip every other tick to halve the draw cost
      if (isMobile && frame % 2 !== 0) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn less aggressively on mobile
      if (isMobile) {
        if (frame % 8 === 0) spawn()
      } else {
        if (frame % 2 === 0) spawn()
        if (frame % 6 === 0) spawn()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(p.life * 0.04) * 0.15
        p.y += p.vy
        p.life--

        if (p.life <= 0) { particles.splice(i, 1); continue }

        const t = p.life / p.maxLife
        const alpha = t < 0.12 ? t / 0.12 : t > 0.75 ? (1 - t) / 0.25 : 1
        const opacity = Math.min(1, alpha) * 0.65

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + opacity + ')'

        if (!isMobile) {
          // shadowBlur is expensive — skip entirely on mobile
          ctx.shadowColor = p.color + '0.9)'
          ctx.shadowBlur = p.size * 4
        }

        ctx.fill()

        if (!isMobile) ctx.shadowBlur = 0
      }
    }

    tick()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
