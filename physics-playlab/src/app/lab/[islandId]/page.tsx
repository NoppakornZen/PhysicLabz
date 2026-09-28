'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'
import { getSubIsland, getIslandName } from '@/data/islands'
import { updateIslandProgress, getProgress } from '@/lib/progress'
import { playClick, playStart, playReset, playFinish, playComplete } from '@/lib/sounds'
import { auth } from '@/lib/firebase'
import { syncProgress } from '@/lib/firestore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { LAB } from '@/data/translations/lab'
import LanguageToggle from '@/components/LanguageToggle'
import LabCanvas from '@/components/lab/LabCanvas'
import DataChart from '@/components/lab/DataChart'
import styles from './page.module.css'

const IDLE_LINES_TH: Record<string, string> = {
  'horizontal-motion': 'ลองปรับ u และ a แล้วดูว่าน้อง Nuto วิ่งเร็วขึ้นไหมนะครับ!',
  'vertical-motion': 'ปล่อยน้อง Nuto ตกจากตึกหรือโยนขึ้นฟ้า จะตกน้ำเมื่อไหร่นะ?',
  'projectile-motion': 'ปรับมุมยิง 45° เพื่อได้ระยะทางไกลสุด! ลองพิสูจน์ดูครับ',
  'newton-1': 'ถ้า μ = 0 จะไม่มีแรงเสียดทานเลย น้อง Nuto จะไถลไปตลอดกาล!',
  'newton-2': 'F = ma — แรงมาก มวลน้อย = เร็วมาก! ลองปรับดูครับ',
  'newton-3': 'มวลต่างกัน ความเร็วต่างกัน แต่แรงเท่ากันเสมอ! แปลกดีนะ',
}

const IDLE_LINES_EN: Record<string, string> = {
  'horizontal-motion': 'Try adjusting u and a to see if Nuto runs faster!',
  'vertical-motion': 'Drop Nuto from a building or throw up - when will it splash?',
  'projectile-motion': 'Set angle to 45° for maximum range! Try it',
  'newton-1': 'If μ = 0, no friction - Nuto will slide forever!',
  'newton-2': 'F = ma — more force, less mass = faster! Try it',
  'newton-3': 'Different masses, different speeds, but equal forces always!',
}

const RUNNING_LINES_TH: Record<string, string[]> = {
  'horizontal-motion': [
    'ดูระยะทาง (s) เพิ่มขึ้นเรื่อยๆ เลย!',
    'v = u + at — ความเร็วเปลี่ยนเป็น linear!',
    'ถ้า a เป็นลบ น้อง Nuto จะค่อยๆ ช้าลงนะครับ',
  ],
  'vertical-motion': [
    'แรงโน้มถ่วง g = 9.8 m/s² ดึงลงตลอดเวลา!',
    'ขึ้นสูงสุดตอนที่ vy = 0 ครับ',
    'พลังงานศักย์แปลงเป็นพลังงานจลน์!',
  ],
  'projectile-motion': [
    'แกนนอนกับแกนดิ่งเป็นอิสระต่อกันนะครับ!',
    'vx คงที่ตลอด — ไม่มีแรงแนวนอน',
    'ดูวิถีโค้งพาราโบลาสวยงามเลย!',
  ],
  'newton-1': [
    'ความเฉื่อย — ถ้าไม่มีแรงลัพธ์ ความเร็วไม่เปลี่ยน!',
    'ยิ่งแรงเสียดทานมาก ยิ่งหยุดเร็ว',
    'พื้นน้ำแข็ง (μ=0) = ไม่มีวันหยุดเลย!',
  ],
  'newton-2': [
    'a = F/m — แรงมาก มวลน้อย เร็วมาก!',
    'ดูกล่องเร่งขึ้นเรื่อยๆ ด้วยความเร่งสม่ำเสมอ!',
    'ลองเพิ่มมวล แล้วดูว่าช้าลงแค่ไหน',
  ],
  'newton-3': [
    'แรงกิริยา = แรงปฏิกิริยา แต่คนละทิศ!',
    'มวลน้อยกว่า → เร็วกว่า แต่แรงเท่ากัน!',
    'เหมือนจรวดปล่อยแก๊ส ตัวจรวดก็เด้งออกไป!',
  ],
}

const RUNNING_LINES_EN: Record<string, string[]> = {
  'horizontal-motion': [
    'Watch distance (s) increasing!',
    'v = u + at — velocity changes linearly!',
    'If a is negative, Nuto slows down',
  ],
  'vertical-motion': [
    'Gravity g = 9.8 m/s² pulls down constantly!',
    'Maximum height when vy = 0',
    'Potential energy converts to kinetic!',
  ],
  'projectile-motion': [
    'Horizontal and vertical axes are independent!',
    'vx stays constant — no horizontal force',
    'Look at that beautiful parabolic path!',
  ],
  'newton-1': [
    'Inertia — if no net force, velocity unchanged!',
    'More friction, faster stop',
    'Ice surface (μ=0) = never stops!',
  ],
  'newton-2': [
    'a = F/m — more force, less mass, faster!',
    'Box accelerating uniformly!',
    'Try increasing mass and see it slow down',
  ],
  'newton-3': [
    'Action = Reaction but opposite direction!',
    'Less mass → faster but equal force!',
    'Like rocket exhaust, rocket bounces back!',
  ],
}

const FINISH_LINES_TH: Record<string, string> = {
  'horizontal-motion': 'จบแล้ว! สังเกตได้ไหมว่า s สอดคล้องกับสูตร ut + ½at²?',
  'vertical-motion': 'ตกถึงน้ำแล้ว! ลองคำนวณเวลาตกด้วยสูตรดูนะครับ',
  'projectile-motion': 'ลงน้ำแล้ว! ลองเปลี่ยนมุมแล้วเปรียบเทียบระยะทางได้เลย',
  'newton-1': 'หยุดแล้ว! สังเกตไหม ยิ่ง μ มาก ยิ่งหยุดเร็ว',
  'newton-2': 'ถึงขอบแล้ว! F/m ยิ่งสูง ยิ่งเร็วจริงๆ ครับ',
  'newton-3': 'แยกออกแล้ว! มวลน้อยได้ความเร็วมากกว่า ใช่ไหม?',
}

const FINISH_LINES_EN: Record<string, string> = {
  'horizontal-motion': 'Done! Notice how s matches the formula ut + ½at²?',
  'vertical-motion': 'Splashed! Try calculating fall time with the formula',
  'projectile-motion': 'Splashed! Try changing angle and compare ranges',
  'newton-1': 'Stopped! Notice - higher μ means faster stop',
  'newton-2': 'Reached edge! Higher F/m really is faster',
  'newton-3': 'Separated! Less mass got more speed, right?',
}

function getParamReaction(islandId: string, param: string, value: number, lang: 'th' | 'en'): string | null {
  if (islandId === 'horizontal-motion') {
    if (param === 'a' && value === 0) return lang === 'th' ? 'a = 0 → ความเร็วคงที่ตลอดไม่มีการเร่งเลย!' : 'a = 0 → constant velocity, no acceleration!'
    if (param === 'a' && value < 0) return lang === 'th' ? 'a ติดลบ! น้อง Nuto จะค่อยๆ ช้าลงแล้วหยุด' : 'Negative a! Nuto will slow down and stop'
    if (param === 'u' && value === 0) return lang === 'th' ? 'u = 0 เริ่มจากหยุดนิ่งเลย!' : 'u = 0, starting from rest!'
  }
  if (islandId === 'vertical-motion') {
    if (param === 'u' && value > 0) return lang === 'th' ? 'โยนขึ้น! น้อง Nuto จะพุ่งขึ้นก่อนแล้วค่อยตกลงมา' : 'Throw upward! Nuto rises first, then falls back down'
    if (param === 'u' && value < 0) return lang === 'th' ? 'u ติดลบ = โยนลงเลยทันที!' : 'Negative u = thrown downward immediately!'
    if (param === 'height' && value >= 70) return lang === 'th' ? 'ตึกสูงมาก น้อง Nuto จะตกนานมากเลย' : 'Very high building — Nuto will fall for a long time'
    if (param === 'height' && value <= 15) return lang === 'th' ? 'ตึกเตี้ยมาก จะตกเร็วมาก!' : 'Low building — Nuto will fall quickly!'
  }
  if (islandId === 'projectile-motion') {
    if (param === 'angle' && value === 45) return lang === 'th' ? '45° คือมุมที่ระยะทางไกลสุด! เจอเองแล้วใช่ไหม?' : '45° gives the maximum range! You found it!'
    if (param === 'angle' && value >= 75) return lang === 'th' ? 'มุมชันมาก จะสูงแต่ไม่ค่อยไกล' : 'Very steep angle — high, but not very far'
    if (param === 'angle' && value <= 15) return lang === 'th' ? 'มุมต่ำมาก ไปไกลแต่ขึ้นไม่สูงเลย' : 'Very low angle — far, but not very high'
    if (param === 'v0' && value >= 28) return lang === 'th' ? 'ความเร็วต้นสูงมาก! จะบินไปไกลมากเลย' : 'Very high initial speed! It will fly far'
  }
  if (islandId === 'newton-1') {
    if (param === 'friction' && value === 0) return lang === 'th' ? 'μ = 0 ไม่มีแรงเสียดทานเลย! น้อง Nuto จะไม่มีวันหยุด' : 'μ = 0 means no friction! Nuto will never stop'
    if (param === 'friction' && value >= 0.4) return lang === 'th' ? 'แรงเสียดทานสูงมาก จะหยุดเร็วมากเลย!' : 'Very high friction — it will stop quickly!'
    if (param === 'u' && value >= 28) return lang === 'th' ? 'เริ่มเร็วมาก! ดูระยะทางก่อนหยุดนะครับ' : 'Starting very fast! Watch the stopping distance'
  }
  if (islandId === 'newton-2') {
    if (param === 'mass' && value >= 12) return lang === 'th' ? 'มวลมากมาก! ความเร่งจะน้อยลงตาม F/m' : 'Very large mass! Acceleration decreases with F/m'
    if (param === 'mass' && value <= 3) return lang === 'th' ? 'มวลน้อยมาก! ความเร่งจะสูงมากเลย' : 'Very small mass! Acceleration will be high'
    if (param === 'force' && value >= 45) return lang === 'th' ? 'แรงสูงมาก! น้อง Nuto จะเร่งแรงมาก' : 'Very high force! Nuto will accelerate strongly'
  }
  if (islandId === 'newton-3') {
    if (param === 'force' && value >= 45) return lang === 'th' ? 'แรงมาก! ทั้งสองฝั่งจะกระเด็นออกไปเร็วมาก' : 'Very high force! Both sides will move apart quickly'
  }
  return null
}

function getRuntimeReaction(
  islandId: string,
  data: { t: number; s: number; v: number },
  prevV: number,
  firedRef: React.MutableRefObject<Set<string>>,
  lang: 'th' | 'en'
): string | null {
  const fire = (key: string, msg: string): string | null => {
    if (firedRef.current.has(key)) return null
    firedRef.current.add(key)
    return msg
  }
  if (data.v > 22 && prevV <= 22)
    return fire('fast', lang === 'th' ? 'เร็วมากเลย! v > 22 m/s น้อง Nuto วิ่งแรงสุดๆ' : 'So fast! v > 22 m/s — Nuto is flying!')
  if (islandId === 'vertical-motion' && prevV > 0.5 && data.v <= 0.5 && data.t > 0.3)
    return fire('peak', lang === 'th' ? 'ถึงจุดสูงสุดแล้ว! vy ≈ 0 ตอนนี้เลย' : 'At the maximum height! vy ≈ 0 right now')
  if (islandId === 'newton-1' && data.v < 0.8 && prevV >= 0.8 && data.t > 0.5)
    return fire('stop', lang === 'th' ? 'กำลังจะหยุดแล้ว! แรงเสียดทานทำงานอยู่' : 'It is about to stop! Friction is working')
  if (data.s > 80 && !firedRef.current.has('far'))
    return fire('far', lang === 'th' ? 'ไปไกลกว่า 80 เมตรแล้ว! สังเกตกราฟด้วยนะครับ' : 'It has traveled over 80 meters! Watch the graph')
  return null
}

export default function LabPage() {
  const router = useRouter()
  const params = useParams()
  const islandId = params.islandId as string
  const lang = useLanguage()

  const [island, setIsland] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const [u, setU] = useState(10)
  const [a, setA] = useState(2)
  const [height, setHeight] = useState(50)
  const [v0, setV0] = useState(20)
  const [angle, setAngle] = useState(45)
  const [friction, setFriction] = useState(0.1)
  const [force, setForce] = useState(20)
  const [mass, setMass] = useState(5)
  const [mass2, setMass2] = useState(5)

  const [telemetry, setTelemetry] = useState({ s: 0, v: 0, t: 0 })
  const [chartData, setChartData] = useState<{ t: number; s: number; v: number }[]>([])
  const [mascotSpeech, setMascotSpeech] = useState('')
  const [done, setDone] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [finalTelemetry, setFinalTelemetry] = useState({ s: 0, v: 0, t: 0 })
  const telemetryRef = useRef({ s: 0, v: 0, t: 0 })

  const commentIdxRef = useRef(0)
  const prevVRef = useRef(0)
  const runtimeFiredRef = useRef<Set<string>>(new Set())

  const IDLE_LINES = lang === 'th' ? IDLE_LINES_TH : IDLE_LINES_EN
  const RUNNING_LINES = lang === 'th' ? RUNNING_LINES_TH : RUNNING_LINES_EN
  const FINISH_LINES = lang === 'th' ? FINISH_LINES_TH : FINISH_LINES_EN
  const ui = {
    back: t('lab.back', LAB, lang), ready: t('lab.status.ready', LAB, lang), running: t('lab.status.running', LAB, lang),
    paused: t('lab.status.paused', LAB, lang), start: t('lab.startExperiment', LAB, lang), pause: t('lab.pause', LAB, lang),
    reset: t('lab.reset', LAB, lang), params: t('lab.params', LAB, lang), formulas: t('lab.formulasUsed', LAB, lang),
    time: t('lab.time', LAB, lang), velocity: t('lab.velocity', LAB, lang), height: t('lab.height', LAB, lang),
    distance: t('lab.displacement', LAB, lang), finish: t('lab.finish', LAB, lang), saved: t('lab.saved', LAB, lang),
    summary: t('lab.summary', LAB, lang), again: t('lab.tryAgain', LAB, lang), saveBack: t('lab.saveBack', LAB, lang),
    initialVelocity: t('lab.initialVelocity', LAB, lang), acceleration: t('lab.acceleration', LAB, lang),
    initialHeight: t('lab.initialHeight', LAB, lang), launchSpeed: t('lab.launchSpeed', LAB, lang), angle: t('lab.angle', LAB, lang),
    friction: t('lab.friction', LAB, lang), force: t('lab.pushForce', LAB, lang), mass: t('lab.mass', LAB, lang),
    actionForce: t('lab.appliedForce', LAB, lang), nuto1: t('lab.nuto1Mass', LAB, lang), nuto2: t('lab.nuto2Mass', LAB, lang),
  }

  useEffect(() => {
    const progress = getProgress()
    if (!progress) { router.replace('/login'); return }
    const isl = getSubIsland(islandId)
    if (!isl) { router.replace('/lobby'); return }
    setIsland(isl)
    setMascotSpeech(IDLE_LINES[islandId] ?? t('lab.instruction.experiment', LAB, lang))
  }, [islandId, router, lang])

  useEffect(() => {
    if (!isRunning || isPaused) return
    commentIdxRef.current = 0
    const lines = RUNNING_LINES[islandId] ?? [t('lab.instruction.experiment', LAB, lang)]
    setMascotSpeech(lines[0])
    const id = setInterval(() => {
      commentIdxRef.current = (commentIdxRef.current + 1) % lines.length
      setMascotSpeech(lines[commentIdxRef.current])
    }, 4000)
    return () => clearInterval(id)
  }, [isRunning, isPaused, islandId, lang])

  const handleReset = useCallback(() => {
    playReset()
    setIsRunning(false)
    setIsPaused(false)
    setResetKey(key => key + 1)
    setTelemetry({ s: 0, v: 0, t: 0 })
    setChartData([])
    prevVRef.current = 0
    runtimeFiredRef.current = new Set()
    setMascotSpeech(IDLE_LINES[islandId] ?? t('lab.resetComplete', LAB, lang))
  }, [islandId, lang])

  const handlePause = useCallback(() => {
    if (isPaused) {
      playStart()
      setIsPaused(false)
      setMascotSpeech(t('lab.resuming', LAB, lang))
    } else {
      setIsPaused(true)
      setMascotSpeech(ui.paused)
    }
  }, [isPaused, lang])

  const handleSimFinish = useCallback(() => {
    playFinish()
    setIsRunning(false)
    setIsPaused(false)
    setFinalTelemetry(telemetryRef.current)
    setShowSummary(true)
    setMascotSpeech(FINISH_LINES[islandId] ?? t('lab.experimentComplete', LAB, lang))
  }, [islandId, lang])

  const handleSaveProgress = () => {
    playComplete()
    updateIslandProgress(islandId, { labDone: true })
    const uid = auth.currentUser?.uid
    if (uid) { const p = getProgress(); if (p) syncProgress(uid, p) }
    setDone(true)
    setTimeout(() => router.push('/lobby'), 1000)
  }

  if (!island) return null

  const renderFormula = () => {
    switch (islandId) {
      case 'horizontal-motion': return (
        <div className={styles.formulaCard}>
          <p><strong>s = ut + ½at²</strong></p>
          <p><strong>v = u + at</strong></p>
        </div>
      )
      case 'vertical-motion': return (
        <div className={styles.formulaCard}>
          <p><strong>y = y₀ + ut - ½gt²</strong></p>
          <p>g = 9.8 m/s²</p>
        </div>
      )
      case 'projectile-motion': return (
        <div className={styles.formulaCard}>
          <p><strong>x = (v₀cosθ)t</strong></p>
          <p><strong>y = (v₀sinθ)t - ½gt²</strong></p>
          <p>θ = {angle}°</p>
        </div>
      )
      case 'newton-1': return (
        <div className={styles.formulaCard}>
          <p><strong>ΣF = 0 → a = 0</strong></p>
          <p><strong>f_k = μ_k · mg</strong></p>
        </div>
      )
      case 'newton-2': return (
        <div className={styles.formulaCard}>
          <p><strong>F = ma</strong></p>
          <p>a = {(force / mass).toFixed(2)} m/s²</p>
        </div>
      )
      case 'newton-3': return (
        <div className={styles.formulaCard}>
          <p><strong>F_Action = −F_Reaction</strong></p>
          <p>{t('lab.force', LAB, lang)} = {force} N {t('lab.onBothSides', LAB, lang)}</p>
        </div>
      )
      default: return null
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/lobby')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {ui.back}
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.modeBadge}>LAB</span>
          <h1 className={styles.title}>{getIslandName(island, lang)}</h1>
        </div>
        <div className={styles.headerRight}>
          <LanguageToggle />
          <span className={styles.statusDot} data-running={isRunning && !isPaused} />
          <span className={styles.statusLabel} data-running={isRunning && !isPaused}>
            {!isRunning ? ui.ready : isPaused ? ui.paused : ui.running}
          </span>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.experimentPane}>
            <div className={styles.canvasWrapper} data-running={isRunning}>
              <LabCanvas
                islandId={islandId}
                isRunning={isRunning}
                isPaused={isPaused}
                resetKey={resetKey}
                time={0}
                u={u} a={a} height={height} v0={v0} angle={angle}
                friction={friction} force={force} mass={mass} mass2={mass2}
                onFinish={handleSimFinish}
                onStateUpdate={(data) => {
                  const reaction = getRuntimeReaction(islandId, data, prevVRef.current, runtimeFiredRef, lang)
                  prevVRef.current = data.v
                  telemetryRef.current = data
                  setTelemetry(data)
                  setChartData(prev => [...prev, { t: data.t, s: data.s, v: data.v }])
                  if (reaction) setMascotSpeech(reaction)
                }}
              />
            </div>
            <DataChart isRunning={isRunning} data={chartData} />
          </div>

          <div className={styles.controlsRow}>
            {!isRunning ? (
              <button className={`${styles.actionBtn} ${styles.startBtn}`} onClick={() => { playStart(); setIsPaused(false); setIsRunning(true) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5V19L19 12Z" fill="currentColor" />
                </svg>
                {ui.start}
              </button>
            ) : (
              <button className={`${styles.actionBtn} ${styles.pauseBtn}`} onClick={() => { playClick(); handlePause() }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19H10V5H6ZM14 5V19H18V5Z" fill="currentColor" />
                </svg>
                {isPaused ? t('lab.resume', LAB, lang) : ui.pause}
              </button>
            )}
            <button className={`${styles.actionBtn} ${styles.resetBtn}`} onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V1L8 5L12 9V6A6 6 0 1 1 6 12H4A8 8 0 1 0 12 4Z" fill="currentColor" />
              </svg>
              {ui.reset}
            </button>
          </div>

          <div className={styles.telemetryPanel} data-running={isRunning}>
            <div className={styles.telemetryItem}>
              <span className={styles.telLabel}>{ui.time}</span>
              <span className={styles.telValue}>{telemetry.t.toFixed(2)}</span>
              <span className={styles.telUnit}>s</span>
            </div>
            <div className={styles.telemetryItem}>
              <span className={styles.telLabel}>{ui.velocity}</span>
              <span className={styles.telValue}>{telemetry.v.toFixed(2)}</span>
              <span className={styles.telUnit}>m/s</span>
            </div>
            <div className={styles.telemetryItem}>
              <span className={styles.telLabel}>{islandId === 'vertical-motion' ? ui.height : ui.distance}</span>
              <span className={styles.telValue}>{telemetry.s.toFixed(2)}</span>
              <span className={styles.telUnit}>m</span>
            </div>
          </div>

        </main>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{ui.params}</h2>
            <div className={styles.sliders}>
              {islandId === 'horizontal-motion' && <>
                <Slider label={`${ui.initialVelocity} (u)`} value={u} min={0} max={30} step={1} unit="m/s" disabled={isRunning} onChange={v => { setU(v); handleReset(); const r = getParamReaction(islandId, 'u', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.acceleration} (a)`} value={a} min={-5} max={10} step={0.5} unit="m/s²" disabled={isRunning} onChange={v => { setA(v); handleReset(); const r = getParamReaction(islandId, 'a', v, lang); if (r) setMascotSpeech(r) }} />
              </>}
              {islandId === 'vertical-motion' && <>
                <Slider label={`${ui.initialVelocity} (u)`} value={u} min={-20} max={30} step={1} unit="m/s" disabled={isRunning} onChange={v => { setU(v); handleReset(); const r = getParamReaction(islandId, 'u', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.initialHeight} (y₀)`} value={height} min={10} max={80} step={5} unit="m" disabled={isRunning} onChange={v => { setHeight(v); handleReset(); const r = getParamReaction(islandId, 'height', v, lang); if (r) setMascotSpeech(r) }} />
              </>}
              {islandId === 'projectile-motion' && <>
                <Slider label={`${ui.launchSpeed} (v₀)`} value={v0} min={5} max={30} step={1} unit="m/s" disabled={isRunning} onChange={v => { setV0(v); handleReset(); const r = getParamReaction(islandId, 'v0', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.angle} (θ)`} value={angle} min={10} max={90} step={5} unit="°" disabled={isRunning} onChange={v => { setAngle(v); handleReset(); const r = getParamReaction(islandId, 'angle', v, lang); if (r) setMascotSpeech(r) }} />
              </>}
              {islandId === 'newton-1' && <>
                <Slider label={`${ui.initialVelocity} (u)`} value={u} min={5} max={30} step={1} unit="m/s" disabled={isRunning} onChange={v => { setU(v); handleReset(); const r = getParamReaction(islandId, 'u', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.friction} (μ)`} value={friction} min={0} max={0.5} step={0.05} unit="" disabled={isRunning} onChange={v => { setFriction(v); handleReset(); const r = getParamReaction(islandId, 'friction', v, lang); if (r) setMascotSpeech(r) }} />
              </>}
              {islandId === 'newton-2' && <>
                <Slider label={`${ui.force} (F)`} value={force} min={5} max={50} step={5} unit="N" disabled={isRunning} onChange={v => { setForce(v); handleReset(); const r = getParamReaction(islandId, 'force', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.mass} (m)`} value={mass} min={2} max={15} step={1} unit="kg" disabled={isRunning} onChange={v => { setMass(v); handleReset(); const r = getParamReaction(islandId, 'mass', v, lang); if (r) setMascotSpeech(r) }} />
              </>}
              {islandId === 'newton-3' && <>
                <Slider label={`${ui.actionForce} (F)`} value={force} min={5} max={50} step={5} unit="N" disabled={isRunning} onChange={v => { setForce(v); handleReset(); const r = getParamReaction(islandId, 'force', v, lang); if (r) setMascotSpeech(r) }} />
                <Slider label={`${ui.nuto1} (m₁)`} value={mass} min={2} max={15} step={1} unit="kg" disabled={isRunning} onChange={v => { setMass(v); handleReset() }} />
                <Slider label={`${ui.nuto2} (m₂)`} value={mass2} min={2} max={15} step={1} unit="kg" disabled={isRunning} onChange={v => { setMass2(v); handleReset() }} />
              </>}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{ui.formulas}</h2>
            {renderFormula()}
          </section>

          <section className={styles.mascotCard}>
            <Mascot pose={isRunning ? 'flying' : 'teaching'} size={100} />
            <div className={styles.speechArea}>
              <SpeechBubble text={mascotSpeech} direction="left" typewriter key={mascotSpeech} />
            </div>
          </section>

          <button
            className={`${styles.doneBtn} ${done ? styles.donePulse : ''}`}
            onClick={handleSaveProgress}
            disabled={done}
          >
            {done ? ui.saved : ui.finish}
          </button>
        </aside>
      </div>

      {showSummary && (
        <div className={styles.summaryOverlay} onClick={() => setShowSummary(false)}>
          <div className={styles.summaryCard} onClick={e => e.stopPropagation()}>
            <h2 className={styles.summaryTitle}>{ui.summary}</h2>
            <div className={styles.summaryStats}>
              <div className={styles.summaryStat}>
                <span className={styles.summaryLabel}>{ui.time}</span>
                <span className={styles.summaryValue}>{finalTelemetry.t.toFixed(2)}</span>
                <span className={styles.summaryUnit}>s</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.summaryLabel}>{ui.velocity}</span>
                <span className={styles.summaryValue}>{finalTelemetry.v.toFixed(2)}</span>
                <span className={styles.summaryUnit}>m/s</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.summaryLabel}>{islandId === 'vertical-motion' ? ui.height : ui.distance}</span>
                <span className={styles.summaryValue}>{finalTelemetry.s.toFixed(2)}</span>
                <span className={styles.summaryUnit}>m</span>
              </div>
            </div>
            <div className={styles.summaryActions}>
              <button className={`${styles.actionBtn} ${styles.resetBtn}`} onClick={() => { setShowSummary(false); handleReset() }}>
                {ui.again}
              </button>
              <button className={`${styles.actionBtn} ${styles.startBtn}`} onClick={() => { setShowSummary(false); handleSaveProgress() }}>
                {ui.saveBack}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; disabled: boolean
  onChange: (v: number) => void
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div className={`${styles.sliderGroup} ${disabled ? styles.sliderDisabled : ''}`}>
      <label className={styles.sliderLabel}>
        <span>{label}</span>
        <strong className={styles.sliderVal}>{value}<span className={styles.sliderUnit}>{unit}</span></strong>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  )
}
