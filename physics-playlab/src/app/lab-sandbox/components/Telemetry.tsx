'use client'
import { useEffect, useState } from 'react'
import { PhysicsObjectData } from '@/lib/handPhysics/constants'
import styles from './Telemetry.module.css'

interface Props {
  objects: PhysicsObjectData[]
  containerRef: React.RefObject<HTMLDivElement | null>
}

function worldToScreen(
  worldX: number,
  worldY: number,
  W: number,
  H: number
): { x: number; y: number } {
  const viewH = 9
  const viewW = viewH * (W / H)
  const nx = (worldX + viewW / 2) / viewW
  const ny = (viewH / 2 - worldY) / viewH
  return { x: nx * W, y: ny * H }
}

const OBJECT_LABELS: Record<string, string> = {
  'friction-box': 'Friction Box',
  'ball': 'Ball',
  'projectile': 'Projectile',
}

const GROUND_Y = -3.5

export default function Telemetry({ objects, containerRef }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      const height = Math.round(entry.contentRect.height)
      setSize(current => current.width === width && current.height === height
        ? current
        : { width, height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  if (objects.length === 0) return null
  const W = size.width
  const H = size.height
  if (!W || !H) return null

  return (
    <div className={styles.root} style={{ width: W, height: H }}>
      {objects.map(obj => {
        const screen = worldToScreen(obj.position.x, obj.position.y, W, H)
        const vMag = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2)
        const h = Math.max(0, obj.position.y - GROUND_Y)
        const ke = 0.5 * obj.mass * vMag * vMag

        return (
          <div
            key={obj.id}
            className={`${styles.telemetry} ${obj.isGrabbed ? styles.grabbed : ''}`}
            style={{
              left: Math.min(W - 130, Math.max(8, screen.x + 16)),
              top: Math.min(H - 90, Math.max(8, screen.y - 64)),
              '--obj-color': obj.color,
            } as React.CSSProperties}
          >
            <span className={styles.objName}>
              {OBJECT_LABELS[obj.type] ?? obj.type}
              {obj.isGrabbed ? ' · HOLD' : ''}
            </span>
            <span className={styles.row}>
              <span className={styles.key}>v</span>
              <span className={styles.val}>{vMag.toFixed(2)} m/s</span>
            </span>
            <span className={styles.row}>
              <span className={styles.key}>h</span>
              <span className={styles.val}>{h.toFixed(2)} m</span>
            </span>
            <span className={styles.row}>
              <span className={styles.key}>K</span>
              <span className={styles.val}>{ke.toFixed(1)} J</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
