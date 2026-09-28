'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'
import { getQuiz, QuizQuestion, getLocalizedQuestion } from '@/data/quizzes'
import { getSubIsland, getIslandName } from '@/data/islands'
import { updateIslandProgress, getProgress } from '@/lib/progress'
import { auth } from '@/lib/firebase'
import { syncProgress } from '@/lib/firestore'
import { playClick, playCorrect, playWrong, playComplete } from '@/lib/sounds'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { QUIZ } from '@/data/translations/quiz'
import LanguageToggle from '@/components/LanguageToggle'
import styles from './page.module.css'

const CORRECT_SPEECHES_TH = ['ใช่เลย!', 'นั่นแหละ!', 'โห รู้เรื่องนี้ด้วย!', 'เยี่ยมมาก!']
const CORRECT_SPEECHES_EN = ['Correct!', 'That\'s right!', 'You know this!', 'Excellent!']
const WRONG_SPEECHES_TH = ['เอ๊ะ ไม่ใช่นะ', 'ผิดแล้วละ', 'ลองใหม่นะ', 'อืม... ไม่ถูก']
const WRONG_SPEECHES_EN = ['Not quite', 'That\'s wrong', 'Try again', 'Hmm... not correct']

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const islandId = params.islandId as string
  const lang = useLanguage()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascotPose, setMascotPose] = useState<'idle' | 'teaching' | 'celebrating' | 'sad' | 'hinting'>('teaching')
  const [mascotSpeech, setMascotSpeech] = useState(lang === 'th' ? 'พร้อมแล้วใช่ไหม ลุยเลย!' : 'Ready? Let\'s go!')
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
    if (finished) return
    if (!answered) {
      setMascotSpeech(t('quiz.ready', QUIZ, lang))
    } else if (selected !== null && questions[current]) {
      setMascotSpeech(selected === questions[current].correctIndex
        ? t('quiz.correct.1', QUIZ, lang)
        : t('quiz.wrong', QUIZ, lang))
    }
    // Language changes should not leave the previous locale in the mascot bubble.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    if (current === 0 || questions.length === 0) return
    if (current === questions.length - 1) {
      setShowBossIntro(true)
      setMascotPose('hinting')
      setMascotSpeech(lang === 'th' ? 'ข้อสุดท้าย!! เตรียมตัวให้ดีนะ...' : 'Final question!! Get ready...')
      const t = setTimeout(() => setShowBossIntro(false), 2800)
      return () => clearTimeout(t)
    }
  }, [current, questions.length, lang])

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const q = questions[current]
    const CORRECT_SPEECHES = lang === 'th' ? CORRECT_SPEECHES_TH : CORRECT_SPEECHES_EN
    const WRONG_SPEECHES = lang === 'th' ? WRONG_SPEECHES_TH : WRONG_SPEECHES_EN

    if (idx === q.correctIndex) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(s => s + 1)
      playCorrect()
      setMascotPose('celebrating')
      if (newStreak >= 5) {
        setMascotSpeech(lang === 'th' ? 'FEVER!! ร้อนมาก!' : 'FEVER!! On fire!')
        setShakeLevel(3)
        setTimeout(() => setShakeLevel(0), 600)
      } else if (newStreak === 4) {
        setMascotSpeech(lang === 'th' ? '4 ติด โหดมากเลย!' : '4 in a row! Amazing!')
        setShakeLevel(2)
        setTimeout(() => setShakeLevel(0), 500)
      } else if (newStreak === 3) {
        setMascotSpeech(lang === 'th' ? '3 ติดแล้ว โห!' : '3 in a row!')
        setShakeLevel(1)
        setTimeout(() => setShakeLevel(0), 400)
      } else if (newStreak === 2) {
        setMascotSpeech(lang === 'th' ? '2 ติดแล้ว!' : '2 in a row!')
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
      const localizedQ = getLocalizedQuestion(q, lang)
      setMascotSpeech(broke
        ? (lang === 'th' ? `โอ้ streak หักแล้ว... ${localizedQ.explanation}` : `Oh no, streak broken... ${localizedQ.explanation}`)
        : (lang === 'th' ? `อุ๊ย ยังไม่ใช่ — ${localizedQ.explanation}` : `Not quite — ${localizedQ.explanation}`))
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
      setMascotSpeech(lang === 'th' ? 'ข้อต่อไป ไปเลย!' : 'Next question, let\'s go!')
    }
  }

  const island = getSubIsland(islandId)
  const q = questions[current]
  const isBoss = questions.length > 0 && current === questions.length - 1
  const pct = questions.length > 0 ? ((current + (answered ? 1 : 0)) / questions.length) * 100 : 0

  const starCount = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0

  const resultInfo = () => {
    if (starCount === 3) return {
      label: lang === 'th' ? '3 ดาว! สุดยอดเลย!' : '3 Stars! Perfect!',
      sub: lang === 'th' ? 'เจ๋งมาก ธงถูกปักแล้ว!' : 'Amazing! Flag planted!',
      color: '#ffd740'
    }
    if (starCount === 2) return {
      label: lang === 'th' ? '2 ดาว! ดีมากเลย' : '2 Stars! Great job!',
      sub: lang === 'th' ? 'ลองอีกรอบเพื่อ 3 ดาว!' : 'Try again for 3 stars!',
      color: '#4caf50'
    }
    if (starCount === 1) return {
      label: lang === 'th' ? '1 ดาว ผ่านแล้ว' : '1 Star - Passed',
      sub: lang === 'th' ? 'ลองใหม่เพื่อ 2 หรือ 3 ดาว' : 'Try again for 2 or 3 stars',
      color: '#ff9800'
    }
    return {
      label: lang === 'th' ? 'ยังไม่ผ่าน' : 'Not Passed',
      sub: lang === 'th' ? 'ไม่เป็นไร ลองใหม่ได้เลย!' : 'No worries, try again!',
      color: '#ef5350'
    }
  }

  if (!q && !finished) return null

  const shakeClass = shakeLevel === 1 ? styles.shake1 : shakeLevel === 2 ? styles.shake2 : shakeLevel === 3 ? styles.shake3 : ''
  const localizedQ = q ? getLocalizedQuestion(q, lang) : null

  return (
    <div className={`${styles.page} ${shakeClass}`}>
      {showBossIntro && (
        <div className={styles.bossIntro}>
          <div className={styles.bossFlash} />
          <div className={styles.bossTitleWrap}>
            <span className={styles.bossWarning}>⚠ FINAL BOSS ⚠</span>
            <span className={styles.bossTitle}>{lang === 'th' ? 'ข้อสุดท้าย!' : 'Final Question!'}</span>
            <span className={styles.bossSub}>{lang === 'th' ? 'คิดให้ดีก่อนตอบ...' : 'Think carefully...'}</span>
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
          {lang === 'th' ? 'กลับ' : 'Back'}
        </button>
        <div className={styles.headerMid}>
          <span className={styles.modeBadge}>Quiz</span>
          <span className={styles.islandName}>{island ? getIslandName(island, lang) : islandId}</span>
        </div>
        <LanguageToggle />
        {!finished && (
          <div className={styles.scoreChip}>
            {score}/{current + (answered ? 1 : 0)} {lang === 'th' ? 'คะแนน' : 'pts'}
          </div>
        )}
      </header>

      {!finished ? (
        <div className={styles.layout}>
          {/* Question area */}
          <main className={styles.main}>
            {/* Progress bar */}
            <div className={styles.progressBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              <span className={styles.progressLabel}>
                {lang === 'th' ? `ข้อ ${current + 1} / ${questions.length}` : `Q ${current + 1} / ${questions.length}`}
              </span>
            </div>

            {/* Question card */}
            <div className={`${styles.questionCard} ${isBoss ? styles.bossCard : ''}`} key={current}>
              <p className={styles.questionNum}>
                {lang === 'th' ? `คำถามข้อที่ ${current + 1}` : `Question ${current + 1}`}
              </p>
              <p className={styles.questionText}>{localizedQ?.question}</p>
              {q.formula && (
                <div className={styles.hintFormula}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#1a7fa0" strokeWidth="2" />
                    <path d="M12 8V12M12 16v.5" stroke="#1a7fa0" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>{lang === 'th' ? 'สูตร: ' : 'Formula: '}</span><code>{q.formula}</code>
                </div>
              )}
            </div>

            {/* Choices */}
            <div className={styles.choices}>
              {localizedQ?.choices.map((choice, i) => {
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
                  <p>{localizedQ?.explanation}</p>
                </div>
                <button id="nextQuestionBtn" className={`btn btn-primary ${styles.nextBtn}`} onClick={handleNext}>
                  {current + 1 >= questions.length
                    ? t('quiz.finish', QUIZ, lang)
                    : t('quiz.next', QUIZ, lang)}
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
                {lang === 'th' ? 'ธงถูกปักบนเกาะแล้ว!' : 'A flag has been planted!'}
              </div>
            )}
            <div className={styles.resultsActions}>
              <button id="retryQuizBtn" className="btn btn-secondary" onClick={() => {
                setCurrent(0); setSelected(null); setAnswered(false)
                setScore(0); setFinished(false); setMascotPose('teaching')
                setMascotSpeech(t('quiz.ready', QUIZ, lang))
                setStreak(0); setShakeLevel(0); setShowBossIntro(false)
              }}>
                {t('quiz.result.retry', QUIZ, lang)}
              </button>
              <button id="backToMapBtn" className="btn btn-primary" onClick={() => router.push('/lobby')}>
                {t('quiz.result.backToLobby', QUIZ, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
