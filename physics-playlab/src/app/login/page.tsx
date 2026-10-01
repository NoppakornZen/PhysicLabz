'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { syncUser, syncProgress, loadProgress, ADMIN_EMAIL } from '@/lib/firestore'
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'
import WelcomeAnimation from '@/components/mascot/WelcomeAnimation'
import { getProgress, initProgress, saveProgress } from '@/lib/progress'
import { playComplete } from '@/lib/sounds'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { AUTH } from '@/data/translations/auth'
import LanguageToggle from '@/components/LanguageToggle'
import styles from './page.module.css'

const ERROR_CODES: Record<string, string> = {
  'auth/email-already-in-use': 'auth.error.emailInUse',
  'auth/invalid-email': 'auth.error.invalidEmail',
  'auth/weak-password': 'auth.error.weakPassword',
  'auth/user-not-found': 'auth.error.userNotFound',
  'auth/wrong-password': 'auth.error.wrongPassword',
  'auth/invalid-credential': 'auth.error.invalidCredential',
}

function getAuthErrorKey(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string') return ERROR_CODES[code] || 'auth.error.generic'
  }
  return 'auth.error.generic'
}

export default function LoginPage() {
  const router = useRouter()
  const lang = useLanguage()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAnim, setShowAnim] = useState(false)
  const [animName, setAnimName] = useState('')
  const justAuthedRef = useRef(false)

  const mascotSpeech = t('auth.mascot.welcome', AUTH, lang)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && !justAuthedRef.current) {
        if (!getProgress()) initProgress(user.email?.split('@')[0] || 'นักเรียน')
        router.replace(user.email === ADMIN_EMAIL ? '/admin' : '/lobby')
      }
    })
    return unsub
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('auth.error.required', AUTH, lang))
      return
    }
    if (tab === 'signup' && !displayName.trim()) {
      setError(t('auth.error.nameRequired', AUTH, lang))
      return
    }
    setIsLoading(true)
    try {
      justAuthedRef.current = true
      if (tab === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        const name = displayName.trim() || user.email?.split('@')[0] || 'Student'
        initProgress(name)
        await syncUser(user.uid, user.email!, name)
        setAnimName(name)
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        let name = user.email?.split('@')[0] || 'Student'
        if (user.email !== ADMIN_EMAIL) {
          const firestoreProgress = await loadProgress(user.uid)
          if (firestoreProgress) {
            saveProgress(firestoreProgress)
            name = firestoreProgress.userName
          } else {
            const local = getProgress()
            name = local?.userName || name
            if (!local) initProgress(name)
          }
        }
        await syncUser(user.uid, user.email!, name)
        setAnimName(user.email === ADMIN_EMAIL ? 'Admin' : name)
      }
      playComplete()
      setShowAnim(true)
    } catch (err: unknown) {
      justAuthedRef.current = false
      setError(t(getAuthErrorKey(err), AUTH, lang))
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      justAuthedRef.current = true
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      const name = user.displayName || user.email?.split('@')[0] || 'Student'
      const firestoreProgress = await loadProgress(user.uid)
      if (firestoreProgress) {
        saveProgress(firestoreProgress)
      } else {
        initProgress(name)
      }
      await syncUser(user.uid, user.email!, name)
      setAnimName(name)
      playComplete()
      setShowAnim(true)
    } catch (err: unknown) {
      justAuthedRef.current = false
      setError(t(getAuthErrorKey(err), AUTH, lang))
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.ocean}>
        <div className={styles.wave1} />
        <div className={styles.wave2} />
        <div className={styles.wave3} />
      </div>
      <div className={styles.cloud1} />
      <div className={styles.cloud2} />
      <div className={styles.cloud3} />
      <div className={styles.islandDeco}>
        <div className={styles.islandTop} />
        <div className={styles.islandBase} />
        <div className={styles.tree1} />
        <div className={styles.tree2} />
      </div>

      {showAnim && (
        <WelcomeAnimation name={animName} onDone={() => router.push(animName === 'Admin' ? '/admin' : '/lobby')} />
      )}

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#4caf50" />
              <path d="M10 22 Q18 8 26 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="18" cy="24" r="3" fill="white" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1 className={styles.title}>{t('auth.title', AUTH, lang)}</h1>
            <p className={styles.subtitle}>{t('auth.subtitle', AUTH, lang)}</p>
          </div>
          <LanguageToggle />
        </div>

        <div className={styles.mascotSection}>
          <div className={styles.mascotContainer}>
            <Mascot pose={isLoading ? 'flying' : 'idle'} size={140} className={styles.mascot} />
          </div>
          <div className={styles.speechContainer}>
            <SpeechBubble text={mascotSpeech} direction="left" typewriter delay={400} />
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'signin' ? styles.tabActive : styles.tabInactive}
            onClick={() => { setTab('signin'); setError('') }}
          >
            {t('auth.tab.signin', AUTH, lang)}
          </button>
          <button
            type="button"
            className={tab === 'signup' ? styles.tabActive : styles.tabInactive}
            onClick={() => { setTab('signup'); setError('') }}
          >
            {t('auth.tab.signup', AUTH, lang)}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {tab === 'signup' && (
            <input
              type="text"
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); setError('') }}
              placeholder={t('auth.field.name', AUTH, lang)}
              className={styles.input}
              maxLength={20}
              disabled={isLoading}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder={t('auth.field.email', AUTH, lang)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={isLoading}
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder={t('auth.field.password', AUTH, lang)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={isLoading}
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
          />
          {error && <p className={styles.errorText} role="alert">{error}</p>}
          <button type="submit" className={`btn btn-primary ${styles.startBtn}`} disabled={isLoading}>
            {isLoading
              ? <span className={styles.loadingDots}>{t('auth.button.loading', AUTH, lang)}</span>
              : tab === 'signup' ? t('auth.button.signup', AUTH, lang) : t('auth.button.signin', AUTH, lang)}
          </button>
        </form>

        <div className={styles.divider}><span>{t('auth.divider', AUTH, lang)}</span></div>

        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isLoading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4A90D9" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {t('auth.button.google', AUTH, lang)}
        </button>

        <div className={styles.formulaRow} aria-hidden="true">
          <span className={styles.formulaTag}>F = ma</span>
          <span className={styles.formulaTag}>v = u + at</span>
          <span className={styles.formulaTag}>E = mc²</span>
        </div>
      </div>
    </div>
  )
}
