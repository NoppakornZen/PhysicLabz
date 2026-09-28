'use client'
import { useEffect, useState, useRef } from 'react'
import styles from './SpeechBubble.module.css'

interface SpeechBubbleProps {
  text: string
  direction?: 'left' | 'right' | 'bottom'
  className?: string
  typewriter?: boolean
  delay?: number
}

export default function SpeechBubble({
  text,
  direction = 'right',
  className = '',
  typewriter = true,
  delay = 0,
}: SpeechBubbleProps) {
  const [displayed, setDisplayed] = useState(typewriter ? '' : text)
  const [visible, setVisible] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true)
      if (!typewriter) {
        setDisplayed(text)
        return
      }
      indexRef.current = 0
      setDisplayed('')
      const type = () => {
        if (indexRef.current <= text.length) {
          setDisplayed(text.slice(0, indexRef.current))
          indexRef.current++
          timerRef.current = setTimeout(type, 35)
        }
      }
      type()
    }, delay)

    return () => {
      clearTimeout(showTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, typewriter, delay])

  if (!visible) return null

  return (
    <div className={`${styles.bubble} ${styles[`dir--${direction}`]} ${className}`}>
      <p className={styles.text}>
        {displayed}
        {typewriter && displayed.length < text.length && (
          <span className={styles.cursor}>|</span>
        )}
      </p>
    </div>
  )
}
