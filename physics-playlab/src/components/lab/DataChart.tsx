'use client'
import { useEffect, useRef } from 'react'

interface DataPoint { t: number; s: number; v: number }
interface Props { isRunning: boolean; data: DataPoint[] }

function niceMax(val: number): number {
  if (val <= 0) return 1
  const exp = Math.floor(Math.log10(val))
  const base = Math.pow(10, exp)
  const frac = val / base
  if (frac <= 1) return base
  if (frac <= 2) return 2 * base
  if (frac <= 5) return 5 * base
  return 10 * base
}

export default function DataChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = window.devicePixelRatio || 1
    const CW = canvas.offsetWidth
    const CH = canvas.offsetHeight
    canvas.width = CW * DPR
    canvas.height = CH * DPR
    ctx.scale(DPR, DPR)

    const W = CW, H = CH
    const L = 38, R = 10, T = 14, B = 32
    const gW = W - L - R
    const gH = H - T - B

    // Background
    ctx.fillStyle = '#0a0e18'
    ctx.fillRect(0, 0, W, H)

    const tMax = data.length > 1 ? niceMax(data[data.length - 1].t) : 5
    const rawSMax = data.length > 0 ? Math.max(...data.map(d => d.s)) : 0
    const rawVMax = data.length > 0 ? Math.max(...data.map(d => Math.abs(d.v))) : 0
    const yMax = niceMax(Math.max(rawSMax, rawVMax, 1))

    const ticks = 4
    ctx.font = `${10 * Math.min(1, CW / 180)}px Courier New, monospace`

    // Grid lines
    for (let i = 0; i <= ticks; i++) {
      const y = T + gH - (gH / ticks) * i
      const x = L + (gW / ticks) * i
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(34,211,238,0.06)'
      ctx.lineWidth = 1
      ctx.moveTo(L, y); ctx.lineTo(L + gW, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, T); ctx.lineTo(x, T + gH)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(34,211,238,0.18)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(L, T); ctx.lineTo(L, T + gH); ctx.lineTo(L + gW, T + gH)
    ctx.stroke()

    // Y labels
    ctx.fillStyle = '#334155'
    ctx.textAlign = 'right'
    for (let i = 0; i <= ticks; i++) {
      const val = (yMax / ticks) * i
      const y = T + gH - (gH / ticks) * i
      ctx.fillText(val >= 100 ? val.toFixed(0) : val.toFixed(1), L - 3, y + 3.5)
    }

    // X labels
    ctx.textAlign = 'center'
    ctx.fillStyle = '#334155'
    for (let i = 0; i <= ticks; i++) {
      const val = (tMax / ticks) * i
      const x = L + (gW / ticks) * i
      ctx.fillText(val.toFixed(1), x, T + gH + 14)
    }

    const toX = (t: number) => L + (t / tMax) * gW
    const toY = (v: number) => T + gH - Math.max(0, Math.min(1, v / yMax)) * gH

    if (data.length > 1) {
      // Displacement fill
      ctx.beginPath()
      data.forEach((p, i) => {
        const x = toX(p.t), y = toY(p.s)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.lineTo(toX(data[data.length - 1].t), T + gH)
      ctx.lineTo(L, T + gH)
      ctx.closePath()
      ctx.fillStyle = 'rgba(34, 211, 238, 0.07)'
      ctx.fill()

      // Displacement line — cyan phosphor glow
      ctx.shadowColor = '#22d3ee'
      ctx.shadowBlur = 6
      ctx.beginPath()
      data.forEach((p, i) => {
        const x = toX(p.t), y = toY(p.s)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.setLineDash([])
      ctx.stroke()

      // Velocity line — amber phosphor glow
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 5
      ctx.beginPath()
      data.forEach((p, i) => {
        const x = toX(p.t), y = toY(Math.abs(p.v))
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.shadowBlur = 0
    } else {
      // Empty state
      ctx.fillStyle = 'rgba(34,211,238,0.12)'
      ctx.font = `11px Courier New, monospace`
      ctx.textAlign = 'center'
      ctx.fillText('-- รอข้อมูล --', L + gW / 2, T + gH / 2 + 4)
    }

    // Axis labels
    ctx.shadowBlur = 0
    ctx.save()
    ctx.translate(9, T + gH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#1e3a50'
    ctx.font = '9px Courier New, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('m / m/s', 0, 0)
    ctx.restore()
    ctx.fillStyle = '#1e3a50'
    ctx.font = '9px Courier New, monospace'
    ctx.textAlign = 'right'
    ctx.fillText('t(s)', W - R, T + gH + 14)
  }, [data])

  return (
    <div style={{
      background: '#0a0e18',
      border: '1px solid #1a2540',
      borderRadius: '10px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '8px 12px 6px',
        borderBottom: '1px solid #1a2540',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#334155', fontFamily: 'Courier New, monospace' }}>
          LIVE GRAPH
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: '#22d3ee', fontWeight: 700, fontFamily: 'Courier New, monospace' }}>
            <span style={{ display: 'inline-block', width: 14, height: 1.5, background: '#22d3ee', borderRadius: 2, boxShadow: '0 0 4px #22d3ee' }} />
            s
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700, fontFamily: 'Courier New, monospace' }}>
            <span style={{ display: 'inline-block', width: 14, height: 1.5, background: '#fbbf24', borderRadius: 2, boxShadow: '0 0 4px #fbbf24' }} />
            v
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'calc(100% - 32px)', minHeight: 160, flex: 1 }}
      />
    </div>
  )
}
