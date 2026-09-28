'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Mascot from '@/components/mascot/Mascot'
import { getLearnContent, LearnContent } from '@/data/learnContent'
import { getSubIsland } from '@/data/islands'
import { updateIslandProgress, getProgress } from '@/lib/progress'
import { playClick, playComplete } from '@/lib/sounds'
import styles from './page.module.css'

export default function LearnPage() {
  const router = useRouter()
  const params = useParams()
  const islandId = params.islandId as string

  const [content, setContent] = useState<LearnContent | null>(null)
  const [activeFormula, setActiveFormula] = useState(0)
  const [mascotLine, setMascotLine] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)

  const conceptRef = useRef<HTMLDivElement>(null)
  const conceptItemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const prog = getProgress()
    if (!prog) { router.replace('/login'); return }
    const c = getLearnContent(islandId)
    if (!c) { router.replace('/lobby'); return }
    setContent(c)
  }, [islandId, router])

  // Scroll-driven concept item reveal
  useEffect(() => {
    if (!content) return
    const observers: IntersectionObserver[] = []
    conceptItemRefs.current.forEach((el) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) el.classList.add(styles.visible) },
        { threshold: 0.25 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [content, styles.visible])

  // Track reading progress by scroll position
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0) setProgress(Math.min(100, (scrolled / max) * 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDone = () => {
    playComplete()
    updateIslandProgress(islandId, { learnDone: true })
    setDone(true)
    setTimeout(() => router.push('/lobby'), 900)
  }

  const nextMascotLine = useCallback(() => {
    if (!content) return
    playClick()
    setMascotLine(p => (p + 1) % content.mascotLines.length)
  }, [content])

  if (!content) return null

  const island = getSubIsland(islandId)
  const heroFormula = content.formulas[0]?.expression ?? ''

  return (
    <div className={styles.page}>
      {/* Scroll progress bar */}
      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.push('/lobby')}
          aria-label="กลับ"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18 L9 12 L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          กลับ
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.modeBadge}>Learn</span>
          <h1 className={styles.title}>{content.title}</h1>
        </div>
      </header>

      {/* Hero zone */}
      <div className={styles.heroZone} aria-hidden="true">
        <div className={styles.heroCornerTL} />
        <div className={styles.heroCornerTR} />
        <div className={styles.heroCornerBL} />
        <div className={styles.heroCornerBR} />
        <div className={styles.heroContent}>
          <p className={styles.heroChapter}>{island?.name ?? islandId}</p>
          <div className={styles.heroFormula}>{heroFormula}</div>
          <p className={styles.heroTitle}>{content.title}</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Main content */}
        <main className={styles.main}>

          {/* ── Concept section ── */}
          <section aria-labelledby="conceptHeading" className={styles.conceptSection}>
            <p id="conceptHeading" className={styles.sectionLabel}>แนวคิดหลัก</p>
            <div className={styles.conceptItems} ref={conceptRef}>
              {content.concept.map((text, i) => (
                <div
                  key={i}
                  className={styles.conceptItem}
                  ref={el => { conceptItemRefs.current[i] = el }}
                >
                  <div className={styles.conceptNode} aria-hidden="true" />
                  <div className={styles.conceptText}>
                    <p className={styles.conceptItemBody}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.sectionDivider} aria-hidden="true" />

          {/* ── Formula section — CRT terminal ── */}
          <section aria-labelledby="formulaHeading" className={styles.formulaSection}>
            <p id="formulaHeading" className={styles.sectionLabel}>สูตรสำคัญ</p>
            <div className={styles.crtScreen}>
              <div className={styles.crtHeader}>
                <div className={styles.crtDot} aria-hidden="true" />
                <span className={styles.crtTitle}>Formula Bank</span>
              </div>
              <div className={styles.crtBody}>
                {/* Tabs */}
                {content.formulas.length > 1 && (
                  <div className={styles.formulaTabs} role="tablist">
                    {content.formulas.map((f, i) => (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={i === activeFormula}
                        className={`${styles.formulaTab} ${i === activeFormula ? styles.active : ''}`}
                        onClick={() => { playClick(); setActiveFormula(i) }}
                      >
                        {f.expression}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active formula card */}
                {content.formulas[activeFormula] && (
                  <div
                    key={activeFormula}
                    className={styles.formulaCard}
                    role="tabpanel"
                  >
                    <div className={styles.formulaDisplay}>
                      {content.formulas[activeFormula].expression}
                    </div>
                    {content.formulas[activeFormula].variables.length > 0 && (
                      <div className={styles.formulaLegend}>
                        {content.formulas[activeFormula].variables.map((v, i) => (
                          <div key={i} className={styles.legendChip}>
                            <span className={styles.legendSym}>{v.symbol}</span>
                            <span className={styles.legendDef}>{v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className={styles.sectionDivider} aria-hidden="true" />

          {/* ── Example section — mission briefing ── */}
          <section aria-labelledby="exampleHeading" className={styles.exampleSection}>
            <p id="exampleHeading" className={styles.sectionLabel}>ตัวอย่างโจทย์</p>
            <div className={styles.missionCard}>
              <div className={styles.missionHeader}>
                <span className={styles.missionTag}>Mission</span>
                <span className={styles.missionId}>EX-{islandId.toUpperCase()}-001</span>
              </div>
              <div className={styles.missionBody}>
                <p className={styles.missionProblem}>{content.example.problem}</p>

                {/* Given values as legend chips */}
                {content.example.given.length > 0 && (
                  <div className={styles.formulaLegend}>
                    {content.example.given.map((g, i) => (
                      <div key={i} className={styles.legendChip}>
                        <span className={styles.legendSym}>{g.label}</span>
                        <span className={styles.legendDef}>{g.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Solution reveal */}
                <div className={styles.solutionReveal}>
                  <button
                    className={styles.revealToggle}
                    onClick={() => { playClick(); setShowSolution(s => !s) }}
                    aria-expanded={showSolution}
                  >
                    {showSolution ? '▲ ซ่อนวิธีทำ' : '▶ ดูวิธีทำ'}
                  </button>

                  <div className={`${styles.solutionContent} ${showSolution ? styles.revealed : ''}`}>
                    <div className={styles.solutionInner}>
                      {content.example.solution.map((step, i) => (
                        <div key={i} className={styles.solutionStep}>
                          <span className={styles.stepNum}>{i + 1}.</span>
                          <span className={styles.stepFormula}>{step}</span>
                        </div>
                      ))}
                      <div className={styles.solutionAnswer}>
                        คำตอบ: {content.example.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Done row ── */}
          <div className={styles.doneRow}>
            <button
              id="learnDoneBtn"
              className={styles.doneBtn}
              onClick={handleDone}
              disabled={done}
            >
              {done ? 'กำลังกลับ...' : 'เรียนจบแล้ว — กลับแผนที่'}
            </button>
          </div>
        </main>

        {/* Mascot sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.mascotArea}>
            <Mascot pose="teaching" size={80} />
            <div className={styles.speechArea}>
              <div className={styles.speechBubble}>
                {content.mascotLines[mascotLine]}
              </div>
              <button
                id="nextSpeechBtn"
                className={styles.nextSpeechBtn}
                onClick={nextMascotLine}
                aria-label="ข้อความถัดไป"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18 L15 12 L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
