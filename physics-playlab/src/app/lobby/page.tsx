'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'
import { MAIN_ISLANDS, SubIsland } from '@/data/islands'
import { getProgress, getUserName, getIslandStatus, clearProgress, getUnlockSeen, markUnlockSeen } from '@/lib/progress'
import { playClick, playPop, playOpen, playClose } from '@/lib/sounds'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import styles from './page.module.css'
import LobbyParticles from '@/components/lobby/LobbyParticles'
import OceanWave from '@/components/lobby/OceanWave'

type IslandStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export default function LobbyPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('นักเรียน')
  const [selectedIsland, setSelectedIsland] = useState<SubIsland | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const [introPhase, setIntroPhase] = useState<'flying' | 'wave' | 'done'>('flying')
  const [mascotSpeech, setMascotSpeech] = useState('')
  const [islandStatuses, setIslandStatuses] = useState<Record<string, IslandStatus>>({})
  const [islandScores, setIslandScores] = useState<Record<string, number>>({})
  const [islandProgressRaw, setIslandProgressRaw] = useState<Record<string, { learnDone: boolean; labDone: boolean; quizScore: number }>>({})
  const [nextIslandId, setNextIslandId] = useState<string | null>(null)
  const [unlockQueue, setUnlockQueue] = useState<string[]>([])
  const [currentUnlock, setCurrentUnlock] = useState<string | null>(null)
  const isFirstVisit = useRef(false)
  const [scrollFrame, setScrollFrame] = useState(1)
  const [timeOfDay, setTimeOfDay] = useState<'dawn'|'day'|'dusk'|'night'>('day')
  const [isMobile, setIsMobile] = useState(false)

  // Mouse parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mx = ((e.clientX / window.innerWidth) - 0.5) * 2
      const my = ((e.clientY / window.innerHeight) - 0.5) * 2
      document.documentElement.style.setProperty('--plx', mx.toFixed(3))
      document.documentElement.style.setProperty('--ply', my.toFixed(3))
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Time of day
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours()
      if (h >= 5 && h < 8)       setTimeOfDay('dawn')
      else if (h >= 8 && h < 18) setTimeOfDay('day')
      else if (h >= 18 && h < 21) setTimeOfDay('dusk')
      else                        setTimeOfDay('night')
    }
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  useEffect(() => {
    let rafPending = false
    const handleScroll = () => {
      if (rafPending) return
      rafPending = true
      requestAnimationFrame(() => {
        rafPending = false
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight <= 0) return
        const scrollPercent = scrollTop / docHeight
        const frame = Math.min(20, Math.max(1, Math.ceil(scrollPercent * 20)))
        setScrollFrame(frame)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const progress = getProgress()
    if (!progress) {
      router.replace('/login')
      return
    }

    setUserName(getUserName())

    // Compute statuses
    const statuses: Record<string, IslandStatus> = {}
    const scores: Record<string, number> = {}
    MAIN_ISLANDS.forEach(main => {
      main.subIslands.forEach(sub => {
        statuses[sub.id] = getIslandStatus(sub.id)
        scores[sub.id] = progress.islandProgress[sub.id]?.quizScore ?? -1
      })
    })
    setIslandStatuses(statuses)
    setIslandScores(scores)

    const rawMap: Record<string, { learnDone: boolean; labDone: boolean; quizScore: number }> = {}
    MAIN_ISLANDS.forEach(main => {
      main.subIslands.forEach(sub => {
        const ip = progress.islandProgress[sub.id]
        rawMap[sub.id] = { learnDone: ip?.learnDone ?? false, labDone: ip?.labDone ?? false, quizScore: ip?.quizScore ?? -1 }
      })
    })
    setIslandProgressRaw(rawMap)

    const allSubs = MAIN_ISLANDS.flatMap(m => m.subIslands)
    const next = allSubs.find(s => statuses[s.id] === 'in-progress') ?? allSubs.find(s => statuses[s.id] === 'available')
    setNextIslandId(next?.id ?? null)

    const seen = getUnlockSeen()
    const newlyUnlocked = Object.entries(statuses)
      .filter(([id, st]) => st === 'available' && !seen.includes(id))
      .map(([id]) => id)
    if (newlyUnlocked.length > 0) setUnlockQueue(newlyUnlocked)

    // Show intro animation only once
    const shown = sessionStorage.getItem('intro_shown')
    if (!shown) {
      isFirstVisit.current = true
      setShowIntro(true)
      setIntroPhase('flying')
      sessionStorage.setItem('intro_shown', '1')

      setTimeout(() => setIntroPhase('wave'), 2000)
      setTimeout(() => {
        setIntroPhase('done')
        setShowIntro(false)
        setMascotSpeech(`ยินดีต้อนรับ ${getUserName()}! เลือกเกาะที่อยากลองก่อนได้เลย`)
      }, 3800)
    } else {
      setMascotSpeech(`${getUserName()} กลับมาแล้ว ไปต่อกันได้เลย!`)
    }
  }, [router])

  useEffect(() => {
    if (unlockQueue.length === 0 || currentUnlock) return
    const [next, ...rest] = unlockQueue
    setCurrentUnlock(next)
    setMascotSpeech('เกาะใหม่ unlock แล้ว! ไปลองดูกัน!')
    const t = setTimeout(() => {
      markUnlockSeen(next)
      setCurrentUnlock(null)
      setUnlockQueue(rest)
    }, 2200)
    return () => clearTimeout(t)
  }, [unlockQueue, currentUnlock])

  const handleIslandClick = (island: SubIsland) => {
    const status = islandStatuses[island.id]
    if (status === 'locked') {
      playClick()
      setMascotSpeech('ยังเข้าไม่ได้นะ ลองทำเกาะก่อนหน้าให้จบก่อน')
      return
    }
    playPop()
    setSelectedIsland(island)
    setMascotSpeech(`โอเค ${island.name} แล้วไปกัน!`)
  }

  const handleModeSelect = (mode: 'learn' | 'lab' | 'quiz') => {
    if (!selectedIsland) return
    playClick()
    router.push(`/${mode}/${selectedIsland.id}`)
  }

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    e.currentTarget.style.transform = `perspective(500px) rotateY(${dx * 14}deg) rotateX(${-dy * 12}deg) translateZ(12px)`
  }

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }

  const statusColor: Record<IslandStatus, string> = {
    locked: '#9e9e9e',
    available: '#4caf50',
    'in-progress': '#ff9800',
    completed: '#2196f3',
  }

  const statusLabel: Record<IslandStatus, string> = {
    locked: 'ล็อค',
    available: 'พร้อมเรียน',
    'in-progress': 'กำลังเรียน',
    completed: 'สำเร็จแล้ว',
  }

  return (
    <div className={styles.page}>
      {/* Intro animation overlay */}
      {showIntro && (
        <div className={styles.introOverlay}>
          <div className={`${styles.introMascot} ${styles[`introPhase--${introPhase}`]}`}>
            <Mascot pose={introPhase === 'done' ? 'idle' : introPhase === 'wave' ? 'celebrating' : 'flying'} size={180} />
            {introPhase === 'wave' && (
              <SpeechBubble
                text={`สวัสดี ${userName}! ยินดีต้อนรับสู่ Physics PlayLab!`}
                direction="right"
                delay={200}
              />
            )}
          </div>
        </div>
      )}

      {/* Scroll-driven Background — single img, src-swapped on scroll */}
      <div className={styles.scrollBackgroundContainer}>
        <img
          src={`/images/lobby/background/bg-${String(scrollFrame).padStart(3, '0')}.jpg`}
          alt=""
          className={styles.scrollBackgroundImg}
        />
      </div>

      {/* Ambient effects */}
      <LobbyParticles />

      {/* Aurora borealis — 1 layer on mobile, 3 on desktop */}
      <div className={styles.aurora} aria-hidden="true">
        <div className={styles.auroraLayer} />
        {!isMobile && <div className={styles.auroraLayer} />}
        {!isMobile && <div className={styles.auroraLayer} />}
      </div>

      {/* Shooting stars — hidden on mobile */}
      {!isMobile && (
        <div className={styles.starsLayer} aria-hidden="true">
          <div className={styles.shootingStar} />
          <div className={styles.shootingStar} />
          <div className={styles.shootingStar} />
          <div className={styles.shootingStar} />
          <div className={styles.shootingStar} />
          <div className={styles.shootingStar} />
        </div>
      )}

      {/* Sea shimmer */}
      <div className={styles.seaShimmer} aria-hidden="true">
        <div className={styles.seaShimmerLayer} />
        <div className={styles.seaShimmerLayer} />
        <div className={styles.seaShimmerGlint} />
        <div className={styles.seaShimmerGlint} />
      </div>

      {/* Time-of-day sky tint */}
      <div className={`${styles.skyTint} ${styles[`skyTint--${timeOfDay}`]}`} aria-hidden="true" />

      {/* Ocean wave */}
      <OceanWave />

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.logoSmall}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#4caf50" />
              <path d="M10 22 Q18 8 26 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="18" cy="24" r="3" fill="white" />
            </svg>
            <span className={styles.logoText}>Physics PlayLab</span>
          </div>
        </div>
        <div className={styles.topRight}>
<span className={styles.userName}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#4caf50" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#4caf50" />
            </svg>
            {userName}
          </span>
          <button
            className={styles.logoutBtn}
            onClick={() => { clearProgress(); signOut(auth); router.push('/login') }}
            aria-label="ออกจากระบบ"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Main world map */}
      <main className={styles.worldMap} role="main">
        <h1 className={styles.mapTitle}>แผนที่โลกฟิสิกส์</h1>


        {/* Islands grid */}
        <div className={styles.islandsContainer}>
          {MAIN_ISLANDS.map((main, mainIdx) => (
            <div key={main.id} className={`${styles.mainIslandGroup} ${styles[`mainIsland--${mainIdx}`]}`}>
              {/* Main island label */}
              <div className={styles.mainIslandLabel}>
                <div className={styles.mainIslandIcon} style={{ background: main.color }}>
                  {mainIdx === 0 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12 H19 M5 12 L12 5 M19 12 L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="white" />
                      <path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span>{main.name}</span>
              </div>

              {/* Sub-islands — no platform wrapper */}
              <div className={styles.subIslandsRow}>
                  {main.subIslands.map((sub, subIdx) => {
                    const status = islandStatuses[sub.id] || 'locked'
                    const islandImages: Record<string, string> = {
                      'horizontal-motion': '/images/islands/island1.png',
                      'vertical-motion': '/images/islands/island2.png',
                      'projectile-motion': '/images/islands/island3.png',
                      'newton-1': '/images/islands/island4.png',
                      'newton-2': '/images/islands/island5.png',
                      'newton-3': '/images/islands/island1.png',
                    }
                    return (
                      <div key={sub.id} className={`${styles.subIslandWrapper} ${currentUnlock === sub.id ? styles.unlocking : ''}`} style={{ position: 'relative' }}>
                        {/* Bridge connector */}
                        {subIdx > 0 && (
                          <div
                            className={styles.bridge}
                            style={{
                              opacity: status !== 'locked' ? 1 : 0.4,
                            }}
                          />
                        )}

                        {nextIslandId === sub.id && (
                          <div className={styles.nextBadge}>ไปต่อ!</div>
                        )}
                        <button
                          className={`${styles.subIsland} ${styles[`status--${status}`]}`}
                          onClick={() => handleIslandClick(sub)}
                          aria-label={`${sub.name} — ${statusLabel[status]}`}
                        >
                          {/* Island shape - replaced with high-quality PNG */}
                          <div
                            className={styles.islandContainerPng}
                            onMouseMove={handleTiltMove}
                            onMouseLeave={handleTiltLeave}
                          >
                            <img
                              src={islandImages[sub.id]}
                              alt={sub.name}
                              className={styles.islandImg}
                            />

                            {/* Status indicator */}
                            {status === 'completed' && (
                              <div className={styles.flag}>
                                <div className={styles.flagPole} />
                                <div className={styles.flagBanner} />
                              </div>
                            )}
                            {status === 'locked' && (
                              <div className={styles.lockIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                  <rect x="5" y="11" width="14" height="10" rx="2" fill="#9e9e9e" />
                                  <path d="M8 11 V7 a4 4 0 0 1 8 0 V11" stroke="#9e9e9e" strokeWidth="2.5" fill="none" />
                                </svg>
                              </div>
                            )}
                            {status === 'available' && (
                              <div className={styles.glowRing} />
                            )}
                            {status === 'in-progress' && (
                              <div className={styles.progressRing} />
                            )}
                            {currentUnlock === sub.id && <div className={styles.unlockBurst} />}
                          </div>

                          {/* Island name */}
                          <div className={styles.islandLabel}>
                            <span className={styles.islandName}>{sub.name}</span>
                            <span
                              className={styles.islandStatus}
                              style={{ color: statusColor[status] }}
                            >
                              {statusLabel[status]}
                            </span>
                            {(() => {
                              const sc = islandScores[sub.id] ?? -1
                              const s = sc >= 9 ? 3 : sc >= 7 ? 2 : sc >= 5 ? 1 : 0
                              return s > 0 ? (
                                <div className={styles.islandStars}>
                                  {[1,2,3].map(n => (
                                    <span key={n} className={n <= s ? styles.starOn : styles.starOff}>★</span>
                                  ))}
                                </div>
                              ) : null
                            })()}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
            </div>
          ))}
        </div>

        {/* ── Lab Sandbox Feature Card ── */}
        <div className={styles.sandboxFeature}>
          <div className={styles.sandboxFeatureInner}>
            <div className={styles.sandboxBg} aria-hidden="true" />

            <div className={styles.sandboxFeatureLeft}>
              <div className={styles.sandboxBadges}>
                <span className={styles.sandboxBadgeLive}>LIVE AR</span>
                <span className={styles.sandboxBadge}>NEW</span>
              </div>
              <h2 className={styles.sandboxTitle}>Lab Sandbox</h2>
              <p className={styles.sandboxDesc}>
                เปิดกล้อง ใช้มือหยิบ object ได้โดยตรง — เห็นแรง, ความเร็ว, พลังงาน ทำงานแบบ real-time
              </p>
              <div className={styles.sandboxTags}>
                <span className={styles.sandboxTag}>Energy Graph</span>
                <span className={styles.sandboxTag}>Slow-mo Replay</span>
                <span className={styles.sandboxTag}>Wall · Platform · Ramp</span>
              </div>
            </div>

            <button
              className={styles.sandboxBtn}
              onClick={() => { playClick(); router.push('/lab-sandbox') }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 3h6M10 3v6.5L5.5 17A1 1 0 006.4 18.5h11.2a1 1 0 00.9-1.5L14 9.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14.5" cy="15.5" r="1.5" fill="currentColor"/>
                <circle cx="10.5" cy="14" r="1" fill="currentColor" opacity="0.7"/>
              </svg>
              เริ่มทดลอง
            </button>
          </div>
        </div>
      </main>

      {/* Island Detail Panel */}
      {selectedIsland && (
        <div
          className={styles.panelOverlay}
          onClick={() => setSelectedIsland(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`รายละเอียด ${selectedIsland.name}`}
        >
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <button
              className={styles.panelClose}
              onClick={() => setSelectedIsland(null)}
              aria-label="ปิด"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 L6 18 M6 6 L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className={styles.panelHeader}>
              <Mascot pose="teaching" size={90} />
              <div>
                <h2 className={styles.panelTitle}>{selectedIsland.name}</h2>
                <p className={styles.panelDesc}>{selectedIsland.description}</p>
                <span
                  className={`badge ${islandStatuses[selectedIsland.id] === 'completed' ? 'badge-success' : islandStatuses[selectedIsland.id] === 'locked' ? 'badge-locked' : 'badge-progress'}`}
                >
                  {statusLabel[islandStatuses[selectedIsland.id] || 'locked']}
                </span>
              </div>
            </div>

            <div className={styles.panelModes}>
              <button
                id={`btn-learn-${selectedIsland.id}`}
                className={styles.modeBtn}
                onClick={() => handleModeSelect('learn')}
              >
                <div className={`${styles.modeIcon} ${styles.modeLearn}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19V7l8-4 8 4v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <rect x="9" y="12" width="6" height="7" rx="1" fill="white" />
                    <circle cx="12" cy="9" r="1.5" fill="white" />
                  </svg>
                </div>
                <div>
                  <p className={styles.modeName}>Learn</p>
                  <p className={styles.modeDesc}>เรียนรู้เนื้อหาและสูตร</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.modeArrow}>
                  <path d="M9 18 L15 12 L9 6" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>

              <button
                id={`btn-lab-${selectedIsland.id}`}
                className={styles.modeBtn}
                onClick={() => handleModeSelect('lab')}
              >
                <div className={`${styles.modeIcon} ${styles.modeLab}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3 L9 13 L4 20 H20 L15 13 V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 13 H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="13" cy="17" r="2" fill="white" opacity="0.8" />
                  </svg>
                </div>
                <div>
                  <p className={styles.modeName}>Lab</p>
                  <p className={styles.modeDesc}>ทดลองจำลองฟิสิกส์จริง</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.modeArrow}>
                  <path d="M9 18 L15 12 L9 6" stroke="#1a7fa0" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>

              <button
                id={`btn-quiz-${selectedIsland.id}`}
                className={styles.modeBtn}
                onClick={() => handleModeSelect('quiz')}
              >
                <div className={`${styles.modeIcon} ${styles.modeQuiz}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M9 9 H15 M9 12 H15 M9 15 H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="17" cy="15" r="2" fill="white" />
                  </svg>
                </div>
                <div>
                  <p className={styles.modeName}>Quiz</p>
                  <p className={styles.modeDesc}>ทดสอบ 10 ข้อ · ปักธงเมื่อได้ 8+</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.modeArrow}>
                  <path d="M9 18 L15 12 L9 6" stroke="#ff9800" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>

              {(() => {
                const ip = islandProgressRaw[selectedIsland.id]
                if (!ip) return null
                const stars = ip.quizScore >= 9 ? 3 : ip.quizScore >= 7 ? 2 : ip.quizScore >= 5 ? 1 : 0
                const quizDone = ip.quizScore >= 0
                return (
                  <div className={styles.panelChecklist}>
                    <p className={styles.panelChecklistTitle}>ความคืบหน้า</p>
                    <div className={styles.checklistItem}>
                      <span className={`${styles.checkDot} ${ip.learnDone ? styles['checkDot--done'] : styles['checkDot--pending']}`}>
                        {ip.learnDone ? '✓' : '–'}
                      </span>
                      <span className={`${styles.checkLabel} ${ip.learnDone ? styles['checkLabel--done'] : ''}`}>Learn</span>
                      <span className={`${styles.checkMeta} ${ip.learnDone ? styles['checkMeta--done'] : ''}`}>{ip.learnDone ? 'สำเร็จ' : 'ยังไม่ได้ทำ'}</span>
                    </div>
                    <div className={styles.checklistItem}>
                      <span className={`${styles.checkDot} ${ip.labDone ? styles['checkDot--done'] : styles['checkDot--pending']}`}>
                        {ip.labDone ? '✓' : '–'}
                      </span>
                      <span className={`${styles.checkLabel} ${ip.labDone ? styles['checkLabel--done'] : ''}`}>Lab</span>
                      <span className={`${styles.checkMeta} ${ip.labDone ? styles['checkMeta--done'] : ''}`}>{ip.labDone ? 'สำเร็จ' : 'ยังไม่ได้ทำ'}</span>
                    </div>
                    <div className={styles.checklistItem}>
                      <span className={`${styles.checkDot} ${quizDone ? styles['checkDot--done'] : styles['checkDot--pending']}`}>
                        {quizDone ? '✓' : '–'}
                      </span>
                      <span className={`${styles.checkLabel} ${quizDone ? styles['checkLabel--done'] : ''}`}>Quiz</span>
                      {quizDone ? (
                        <span className={styles.starRow}>
                          {[1,2,3].map(n => <span key={n} className={n <= stars ? styles.starOn : styles.starOff}>★</span>)}
                        </span>
                      ) : (
                        <span className={styles.checkMeta}>ยังไม่ได้ทำ</span>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Scroll-driven Mascot Speech on the right */}
      {mascotSpeech && (
        <div className={styles.scrollMascotContainer}>
          <Mascot pose="idle" size={80} />
          <div className={styles.scrollMascotSpeech}>
            <SpeechBubble text={mascotSpeech} direction="left" typewriter delay={200} />
          </div>
        </div>
      )}

      {/* Progress strip */}
      {(() => {
        const allSubs = MAIN_ISLANDS.flatMap(m => m.subIslands)
        const completedCount = allSubs.filter(s => islandStatuses[s.id] === 'completed').length
        const totalStars = allSubs.reduce((acc, s) => {
          const sc = islandScores[s.id] ?? -1
          return acc + (sc >= 9 ? 3 : sc >= 7 ? 2 : sc >= 5 ? 1 : 0)
        }, 0)
        const pct = Math.round((completedCount / allSubs.length) * 100)
        return (
          <div className={styles.progressStrip}>
            <span className={styles.progressStat}>
              <strong>{completedCount}</strong>/{allSubs.length} เกาะ
            </span>
            <div className={styles.progressDivider} />
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ transform: `scaleX(${pct / 100})` }} />
            </div>
            <div className={styles.progressDivider} />
            <span className={styles.progressStat}>
              <strong>{totalStars}</strong>/{allSubs.length * 3} ดาว
            </span>
          </div>
        )
      })()}
    </div>
  )
}
