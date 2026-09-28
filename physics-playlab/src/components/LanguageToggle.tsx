'use client'
import { useState, useEffect } from 'react'
import { getLanguage, setLanguage, type Language } from '@/lib/i18n'
import styles from './LanguageToggle.module.css'

export default function LanguageToggle() {
  const [lang, setLang] = useState<Language>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLang(getLanguage())
    setMounted(true)
  }, [])

  const toggle = () => {
    const newLang: Language = lang === 'th' ? 'en' : 'th'
    setLanguage(newLang)
    setLang(newLang)
    // Force re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className={styles.toggle}
      aria-label={lang === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย'}
      title={lang === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย'}
    >
      <span className={lang === 'th' ? styles.active : styles.inactive}>TH</span>
      <span className={styles.divider}>|</span>
      <span className={lang === 'en' ? styles.active : styles.inactive}>EN</span>
    </button>
  )
}
