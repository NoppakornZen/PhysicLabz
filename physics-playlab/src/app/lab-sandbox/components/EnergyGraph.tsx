'use client'
import { useRef, useEffect } from 'react'
import { PhysicsObjectData } from '@/lib/handPhysics/constants'
import { GROUND_Y } from '@/lib/handPhysics/PhysicsWorld'

interface Props {
  objects: PhysicsObjectData[]
  gravity: number
}

const HISTORY = 120

export default function EnergyGraph({ objects, gravity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keHist = useRef<number[]>([])
  const peHist = useRef<number[]>([])
  const eHist = useRef<number[]>([])

  useEffect(() => {
    let ke = 0, pe = 0
    for (const obj of objects) {
      if (obj.isGrabbed) continue
      ke += 0.5 * obj.mass * (obj.velocity.x ** 2 + obj.velocity.y ** 2)
      pe += obj.mass * gravity * Math.max(0, obj.position.y - GROUND_Y)
    }
    const total = ke + pe

    keHist.current.push(ke)
    peHist.current.push(pe)
    eHist.current.push(total)
    if (keHist.current.length > HISTORY) {
      keHist.current.shift()
      peHist.current.shift()
      eHist.current.shift()
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(4,8,15,0.82)'
    ctx.fillRect(0, 0, W, H)

    const allVals = [...keHist.current, ...peHist.current, ...eHist.current]
    const maxVal = Math.max(0.5, ...allVals)

    function drawLine(data: number[], color: string, dash: number[] = []) {
      if (!ctx) return
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.4
      ctx.setLineDash(dash)
      const n = data.length
      for (let i = 0; i < n; i++) {
        const x = (i / (HISTORY - 1)) * W
        const y = H - 6 - (data[i] / maxVal) * (H - 14)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    drawLine(peHist.current, '#ffb347')
    drawLine(keHist.current, '#00e5ff')
    drawLine(eHist.current, 'rgba(255,255,255,0.65)', [4, 3])

    // Labels bottom-left
    const labelY = [H - 6, H - 18, H - 30]
    const labels = [
      { text: `KE ${ke.toFixed(2)} J`, color: '#00e5ff' },
      { text: `PE ${pe.toFixed(2)} J`, color: '#ffb347' },
      { text: `E  ${total.toFixed(2)} J`, color: 'rgba(255,255,255,0.7)' },
    ]
    ctx.font = '10px monospace'
    for (let i = 0; i < labels.length; i++) {
      ctx.fillStyle = labels[i].color
      ctx.fillText(labels[i].text, 5, labelY[i])
    }
  }, [objects, gravity])

  if (objects.length === 0) return null

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={90}
      style={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        borderRadius: 8,
        border: '1px solid rgba(0,229,255,0.2)',
        pointerEvents: 'none',
      }}
    />
  )
}
