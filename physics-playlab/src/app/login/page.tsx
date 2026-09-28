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
import styles from './page.module.css'

const ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้แล้ว',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/user-not-found': 'ไม่พบบัญชีนี้',
  'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAnim, setShowAnim] = useState(false)
  const [animName, setAnimName] = useState('')
  const [mascotSpeech] = useState('เฮ้! นูโตะอยู่นี่เอง ฟิสิกส์ไม่ได้น่ากลัวอย่างที่คิดนะ')
  const justAuthedRef = useRef(false)

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
    if (!email || !password) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    if (tab === 'signup' && !displayName.trim()) { setError('กรุณาใส่ชื่อของคุณ'); return }
    setIsLoading(true)
    try {
      justAuthedRef.current = true
      if (tab === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        const name = displayName.trim() || user.email?.split('@')[0] || 'นักเรียน'
        initProgress(name)
        await syncUser(user.uid, user.email!, name)
        setAnimName(name)
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        let name = user.email?.split('@')[0] || 'นักเรียน'
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
    } catch (err: any) {
      justAuthedRef.current = false
      setError(ERRORS[err.code] ?? 'มีบางอย่างผิดพลาด ลองใหม่ดูนะ')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      justAuthedRef.current = true
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      const name = user.displayName || user.email?.split('@')[0] || 'นักเรียน'
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
    } catch (err: any) {
      justAuthedRef.current = false
      setError(ERRORS[err.code] ?? 'มีบางอย่างผิดพลาด ลองใหม่ดูนะ')
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
          <div>
            <h1 className={styles.title}>Physics PlayLab</h1>
            <p className={styles.subtitle}>ฟิสิกส์ไม่ยากอย่างที่คิด — มาลองดูด้วยกัน</p>
          </div>
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
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            className={tab === 'signup' ? styles.tabActive : styles.tabInactive}
            onClick={() => { setTab('signup'); setError('') }}
          >
            สมัครสมาชิก
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {tab === 'signup' && (
            <input
              type="text"
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); setError('') }}
              placeholder="ชื่อเล่นหรือชื่อจริงก็ได้"
              className={styles.input}
              maxLength={20}
              disabled={isLoading}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="อีเมล"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={isLoading}
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="รหัสผ่าน อย่างน้อย 6 ตัว"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={isLoading}
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
          />
          {error && <p className={styles.errorText} role="alert">{error}</p>}
          <button type="submit" className={`btn btn-primary ${styles.startBtn}`} disabled={isLoading}>
            {isLoading
              ? <span className={styles.loadingDots}>รอแป๊บนึง</span>
              : tab === 'signup' ? 'สมัครแล้วเริ่มเลย' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className={styles.divider}><span>หรือ</span></div>

        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isLoading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4A90D9" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          เข้าสู่ระบบด้วย Google
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
