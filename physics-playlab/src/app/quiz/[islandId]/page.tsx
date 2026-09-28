'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'
import { getQuiz, QuizQuestion } from '@/data/quizzes'
import { getSubIsland } from '@/data/islands'
import { updateIslandProgress, getProgress } from '@/lib/progress'
import { auth } from '@/lib/firebase'
import { syncProgress } from '@/lib/firestore'
import { playClick, playCorrect, playWrong, playComplete } from '@/lib/sounds'
import styles from './page.module.css'

const CORRECT_SPEECHES = ['ใช่เลย!', 'นั่นแหละ!', 'โห รู้เรื่องนี้ด้วย!', 'เยี่ยมมาก!']

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const islandId = params.islandId as string

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascotPose, setMascotPose] = useState<'idle' | 'teaching' | 'celebrating' | 'sad' | 'hinting'>('teaching')
  const [mascotSpeech, setMascotSpeech] = useState('พร้อมแล้วใช่ไหม ลุยเลย!')
  const [streak, setStreak] = useState(0)
  const [shakeLevel, setShakeLevel] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [showBossIntro, setShowBossIntro] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    if (!progress) { router.replace('/login'); return }
    const quiz = getQuiz(islandId)
    if (!quiz) { router.replace('/lobby'); return }
    setQuestions(quiz.questions)
  }, [islandId, router])

  useEffect(() => {
    if (current === 0 || questions.length === 0) return
    if (current === questions.length - 1) {
      setShowBossIntro(true)
      setMascotPose('hinting')
      setMascotSpeech('ข้อสุดท้าย!! เตรียมตัวให้ดีนะ...')
      const t = setTimeout(() => setShowBossIntro(false), 2800)
      return () => clearTimeout(t)
    }
  }, [current, questions.length])

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const q = questions[current]
    if (idx === q.correctIndex) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(s => s + 1)
      playCorrect()
      setMascotPose('celebrating')
      if (newStreak >= 5) {
        setMascotSpeech('FEVER!! ร้อนมาก!')
        setShakeLevel(3)
        setTimeout(() => setShakeLevel(0), 600)
      } else if (newStreak === 4) {
        setMascotSpeech('4 ติด โหดมากเลย!')
        setShakeLevel(2)
        setTimeout(() => setShakeLevel(0), 500)
      } else if (newStreak === 3) {
        setMascotSpeech('3 ติดแล้ว โห!')
        setShakeLevel(1)
        setTimeout(() => setShakeLevel(0), 400)
      } else if (newStreak === 2) {
        setMascotSpeech('2 ติดแล้ว!')
      } else {
        setMascotSpeech(CORRECT_SPEECHES[Math.floor(Math.random() * CORRECT_SPEECHES.length)])
      }
      if (newStreak >= 2) {
        setShowCombo(true)
        setTimeout(() => setShowCombo(false), 900)
      }
    } else {
      const broke = streak >= 3
      setStreak(0)
      playWrong()
      setMascotPose('sad')
      setMascotSpeech(broke ? `โอ้ streak หักแล้ว... ${q.explanation}` : `อุ๊ย ยังไม่ใช่ — ${q.explanation}`)
    }
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      playComplete()
      setFinished(true)
      const finalScore = score + (selected === questions[current].correctIndex ? 0 : 0)
      updateIslandProgress(islandId, { quizScore: score })
      const uid = auth.currentUser?.uid
      const progress = getProgress()
      if (uid && progress) syncProgress(uid, progress)
      if (score >= 8) setMascotPose('celebrating')
      else if (score >= 5) setMascotPose('idle')
      else setMascotPose('sad')
    } else {
      playClick()
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setMascotPose('teaching')
      setMascotSpeech('ข้อต่อไป ไปเลย!')
    }
  }

  const island = getSubIsland(islandId)
  const q = questions[current]
  const isBoss = questions.length > 0 && current === questions.length - 1
  const pct = questions.length > 0 ? ((current + (answered ? 1 : 0)) / questions.length) * 100 : 0

  const starCount = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0

  const resultInfo = () => {
    if (starCount === 3) return { label: '3 ดาว! สุดยอดเลย!', sub: 'เจ๋งมาก ธงถูกปักแล้ว!', color: '#ffd740' }
    if (starCount === 2) return { label: '2 ดาว! ดีมากเลย', sub: 'ลองอีกรอบเพื่อ 3 ดาว!', color: '#4caf50' }
    if (starCount === 1) return { label: '1 ดาว ผ่านแล้ว', sub: 'ลองใหม่เพื่อ 2 หรือ 3 ดาว', color: '#ff9800' }
    return { label: 'ยังไม่ผ่าน', sub: 'ไม่เป็นไร ลองใหม่ได้เลย!', color: '#ef5350' }
  }

  if (!q && !finished) return null

  const shakeClass = shakeLevel === 1 ? styles.shake1 : shakeLevel === 2 ? styles.shake2 : shakeLevel === 3 ? styles.shake3 : ''

  return (
    <div className={`${styles.page} ${shakeClass}`}>
      {showBossIntro && (
        <div className={styles.bossIntro}>
          <div className={styles.bossFlash} />
          <div className={styles.bossTitleWrap}>
            <span className={styles.bossWarning}>⚠ FINAL BOSS ⚠</span>
            <span className={styles.bossTitle}>ข้อสุดท้าย!</span>
            <span className={styles.bossSub}>คิดให้ดีก่อนตอบ...</span>
          </div>
          <div className={styles.bossEmbers} />
        </div>
      )}
      {showCombo && (
        <div className={`${styles.comboBadge} ${streak >= 5 ? styles.comboFever : streak >= 4 ? styles.comboHot : streak >= 3 ? styles.comboWarm : styles.comboStart}`}>
          <span className={styles.comboNum}>{streak}x</span>
          <span className={styles.comboWord}>{streak >= 5 ? 'FEVER!!' : 'COMBO!'}</span>
        </div>
      )}
      {streak >= 5 && !finished && <div className={styles.feverOverlay} />}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/lobby')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18 L9 12 L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          กลับ
        </button>
        <div className={styles.headerMid}>
          <span className={styles.modeBadge}>Quiz</span>
          <span className={styles.islandName}>{island?.name}</span>
        </div>
        {!finished && (
          <div className={styles.scoreChip}>{score}/{current + (answered ? 1 : 0)} คะแนน</div>
        )}
      </header>

      {!finished ? (
        <div className={styles.layout}>
          {/* Question area */}
          <main className={styles.main}>
            {/* Progress bar */}
            <div className={styles.progressBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              <span className={styles.progressLabel}>ข้อ {current + 1} / {questions.length}</span>
            </div>

            {/* Question card */}
            <div className={`${styles.questionCard} ${isBoss ? styles.bossCard : ''}`} key={current}>
              <p className={styles.questionNum}>คำถามข้อที่ {current + 1}</p>
              <p className={styles.questionText}>{q.question}</p>
              {q.formula && (
                <div className={styles.hintFormula}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#1a7fa0" strokeWidth="2" />
                    <path d="M12 8V12M12 16v.5" stroke="#1a7fa0" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>สูตร: </span><code>{q.formula}</code>
                </div>
              )}
            </div>

            {/* Choices */}
            <div className={styles.choices}>
              {q.choices.map((choice, i) => {
                let state = ''
                if (answered) {
                  if (i === q.correctIndex) state = styles.choiceCorrect
                  else if (i === selected) state = styles.choiceWrong
                  else state = styles.choiceDim
                }
                return (
                  <button
                    key={i}
                    id={`choice-${i}`}
                    className={`${styles.choice} ${state}`}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                  >
                    <span className={styles.choiceLetter}>{String.fromCharCode(65 + i)}</span>
                    <span className={styles.choiceText}>{choice}</span>
                    {answered && i === q.correctIndex && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.choiceIcon}>
                        <path d="M5 12 L10 17 L19 7" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {answered && i === selected && i !== q.correctIndex && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.choiceIcon}>
                        <path d="M6 6 L18 18 M18 6 L6 18" stroke="#ef5350" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation + Next */}
            {answered && (
              <div className={styles.explanationRow}>
                <div className={styles.explanation}>
                  <p>{q.explanation}</p>
                </div>
                <button id="nextQuestionBtn" className={`btn btn-primary ${styles.nextBtn}`} onClick={handleNext}>
                  {current + 1 >= questions.length ? 'ดูผลลัพธ์' : 'ข้อถัดไป'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18 L15 12 L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </main>

          {/* Mascot */}
          <aside className={styles.sidebar}>
            <div className={styles.mascotArea}>
              <Mascot pose={mascotPose} size={120} />
              <SpeechBubble key={mascotSpeech} text={mascotSpeech} direction="left" typewriter delay={100} />
            </div>
          </aside>
        </div>
      ) : (
        /* Results screen */
        <div className={styles.results}>
          <div className={styles.resultsCard}>
            <Mascot pose={starCount >= 2 ? 'celebrating' : starCount === 1 ? 'idle' : 'sad'} size={160} />
            <h2 className={styles.resultsTitle} style={{ color: resultInfo().color }}>{resultInfo().label}</h2>
            <div className={styles.starRow}>
              {[1,2,3].map(n => (
                <span key={n} className={n <= starCount ? styles.starOn : styles.starOff}>★</span>
              ))}
            </div>
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreNum}>{score}</span>
              <span className={styles.scoreDen}>/ {questions.length}</span>
            </div>
            <p className={styles.scoreSubtitle}>{resultInfo().sub}</p>
            {starCount > 0 && (
              <div className={styles.flagBadge}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3 V21 M6 5 H17 L14 10 H17 L14 15 H6" stroke="#f44336" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                ธงถูกปักบนเกาะแล้ว!
              </div>
            )}
            <div className={styles.resultsActions}>
              <button id="retryQuizBtn" className="btn btn-secondary" onClick={() => {
                setCurrent(0); setSelected(null); setAnswered(false)
                setScore(0); setFinished(false); setMascotPose('teaching')
                setMascotSpeech('พร้อมแล้วใช่ไหม ลุยเลย!')
                setStreak(0); setShakeLevel(0); setShowBossIntro(false)
              }}>
                ทำใหม่
              </button>
              <button id="backToMapBtn" className="btn btn-primary" onClick={() => router.push('/lobby')}>
                กลับแผนที่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
