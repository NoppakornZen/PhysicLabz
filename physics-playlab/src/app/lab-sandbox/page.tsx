'use client'
import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useHandTracking } from '@/hooks/useHandTracking'
import { usePhysicsWorld } from '@/hooks/usePhysicsWorld'
import Scene3D from './components/Scene3D'
import ObjectBox from './components/ObjectBox'
import SettingsPanel from './components/SettingsPanel'
import Telemetry from './components/Telemetry'
import EnergyGraph from './components/EnergyGraph'
import styles from './page.module.css'

export default function LabSandboxPage() {
  const router = useRouter()
  const sceneRef = useRef<HTMLDivElement>(null)

  const { videoRef, skeletonCanvasRef, handState, handStateRef, cameraReady, cameraError } = useHandTracking()
  const { objects, objectsRef, worldRef, gravity, setGravity, spawnObject, removeAll } = usePhysicsWorld(handState)

  const focus = objects.find(o => !o.isStatic) ?? null
  const dynamicCount = objects.filter(o => !o.isStatic).length
  const live = useMemo(() => {
    if (!focus) return null
    const v = Math.hypot(focus.velocity.x, focus.velocity.y)
    const h = Math.max(0, focus.position.y - (-3.5))
    const fg = focus.mass * gravity
    return { v, h, fg, mass: focus.mass, type: focus.type, color: focus.color }
  }, [focus, gravity])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          onClick={() => router.push('/lobby')}
          className={styles.backBtn}
          aria-label="กลับ"
        >
          ← กลับ
        </button>

        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Lab Sandbox</h1>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE AR
          </span>
        </div>

        <div className={styles.handStatus}>
          {handState.hasHand ? (
            <>
              <span className={styles.dotOn} />
              <span>มือ {Math.round(handState.confidence * 100)}%</span>
              {handState.isGrabbing && (
                <span className={styles.grabBadge}>GRAB</span>
              )}
            </>
          ) : cameraError ? (
            <>
              <span className={styles.dotFallback} />
              <span className={styles.fallbackStatus}>เมาส์ / สัมผัส</span>
            </>
          ) : (
            <>
              <span className={styles.dotOff} />
              <span className={styles.noHand}>รอตรวจจับมือ…</span>
            </>
          )}
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.sceneArea} ref={sceneRef}>
          <div className={styles.sceneFrame} aria-hidden="true" />

          <video
            ref={videoRef}
            className={styles.webcam}
            playsInline
            muted
            autoPlay
          />

          <canvas
            ref={skeletonCanvasRef}
            className={styles.skeleton}
          />

          <Scene3D
            objectsRef={objectsRef}
            handStateRef={handStateRef}
            worldRef={worldRef}
          />

          <Telemetry objects={objects} containerRef={sceneRef} />
          <div className={styles.energyGraphWrap}>
            <EnergyGraph objects={objects} gravity={gravity} />
          </div>

          {/* Floating mass label — follows the grabbed object */}
          {(() => {
            const grabbed = objects.find(o => o.isGrabbed)
            const np = handState.grabPointNormalized
            if (!grabbed || !np) return null
            const lx = (1 - np.x) * 100
            const ly = np.y * 100
            const baseMass = grabbed.type === 'ball' ? 0.5 : grabbed.type === 'projectile' ? 1.0 : 2.0
            const multiplier = grabbed.mass / baseMass
            return (
              <div
                className={styles.massLabel}
                style={{ left: `${lx}%`, top: `${Math.max(4, ly - 12)}%` }}
              >
                <span className={styles.massLabelVal}>{grabbed.mass.toFixed(1)}</span>
                <span className={styles.massLabelUnit}>kg</span>
                {multiplier > 1.05 && (
                  <span className={styles.massLabelMult}>×{multiplier.toFixed(1)}</span>
                )}
              </div>
            )
          })()}

          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <i className={styles.swatchV} /> v ความเร็ว
            </span>
            <span className={styles.legendItem}>
              <i className={styles.swatchG} /> g แรงโน้มถ่วง
            </span>
            <span className={styles.legendItem}>
              <i className={styles.swatchTrail} /> เส้นทาง
            </span>
          </div>

          {live && (
            <div className={styles.liveHud}>
              <div className={styles.hudCell}>
                <span className={styles.hudKey}>m</span>
                <span className={styles.hudVal}>{live.mass.toFixed(1)} <small>kg</small></span>
              </div>
              <div className={styles.hudCell}>
                <span className={styles.hudKey}>h</span>
                <span className={styles.hudVal}>{live.h.toFixed(2)} <small>m</small></span>
              </div>
              <div className={styles.hudCell}>
                <span className={styles.hudKey}>v</span>
                <span className={styles.hudVal}>{live.v.toFixed(2)} <small>m/s</small></span>
              </div>
              <div className={styles.hudCell}>
                <span className={styles.hudKey}>Fg</span>
                <span className={styles.hudVal}>{live.fg.toFixed(1)} <small>N</small></span>
              </div>
              <div className={styles.hudFormula}>
                Fg = mg = {live.mass.toFixed(1)} × {gravity.toFixed(1)}
              </div>
            </div>
          )}

          {!cameraReady && !cameraError && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loader}>
                <div className={styles.spinner} />
                <div className={styles.loadingText}>กำลังเปิดกล้อง + Hand Tracking…</div>
                <div className={styles.loadingSub}>ประมวลผลในเครื่อง · ไม่บันทึกภาพ</div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className={styles.cameraNotice} role="status">
              {cameraError}
            </div>
          )}

          {(cameraReady || cameraError) && !handState.hasHand && objects.length === 0 && (
            <div className={styles.hint}>
              <p className={styles.hintMain}>{cameraError ? 'เลือกวัตถุจากแถบด้านล่าง' : 'ยกมือให้กล้องเห็น'}</p>
              <p className={styles.hintSub}>
                {cameraError ? 'ลากเพื่อหยิบ · ปล่อยเพื่อโยน' : 'หยิบ = บีบนิ้วโป้ง+ชี้ · โยน = เหวี่ยงแล้วปล่อย'}
              </p>
            </div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <ObjectBox
            onSpawn={spawnObject}
            count={dynamicCount}
            max={3}
          />

          <div className={styles.divider} />

          <SettingsPanel
            gravity={gravity}
            onGravityChange={setGravity}
            onReset={removeAll}
          />

          <div className={styles.divider} />

          <div className={styles.guide}>
            <p className={styles.guideTitle}>โชว์ให้กรรมการเห็น</p>
            <ul className={styles.guideList}>
              <li>Spawn ลูกบอล → ปล่อยจากที่สูง</li>
              <li>สังเกตลูกศร <b>v</b> และเส้นทาง</li>
              <li>เปลี่ยน Gravity เป็น Moon</li>
              <li>โยน Projectile แล้วดูวิถีโค้ง</li>
            </ul>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipLabel}>PHYSICS LIVE</span>
            <p className={styles.tipText}>
              ตัวเลข F, v, a บนจออัปเดตตามมือจริง — เห็นสูตรทำงานทันที
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
