'use client'
import { useState, useEffect } from 'react'
import { getLanguage, type Language } from '@/lib/i18n'

export function useLanguage() {
  const [lang, setLang] = useState<Language>('th')

  useEffect(() => {
    setLang(getLanguage())

    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>
      setLang(customEvent.detail)
    }

    window.addEventListener('languageChange', handleChange)
    return () => window.removeEventListener('languageChange', handleChange)
  }, [])

  return lang
}
