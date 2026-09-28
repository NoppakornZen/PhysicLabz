'use client'
import { useState } from 'react'
import { startBgMusic, stopBgMusic } from '@/lib/bgMusic'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { COMMON } from '@/lib/i18n'

export default function MusicToggle() {
  const [on, setOn] = useState(false)
  const lang = useLanguage()

  const toggle = () => {
    if (on) { stopBgMusic(); setOn(false) }
    else { startBgMusic(); setOn(true) }
  }

  return (
    <button
      onClick={toggle}
      title={t(on ? 'audio.turnOff' : 'audio.turnOn', COMMON, lang)}
      style={{
        position: 'fixed', bottom: 18, left: 18, zIndex: 999,
        width: 42, height: 42, borderRadius: '50%',
        background: on ? 'rgba(76,175,80,0.88)' : 'rgba(30,30,30,0.72)',
        border: `2px solid ${on ? 'rgba(76,175,80,0.9)' : 'rgba(255,255,255,0.18)'}`,
        backdropFilter: 'blur(10px)',
        boxShadow: on ? '0 0 14px rgba(76,175,80,0.45)' : '0 2px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s ease', color: '#fff', fontSize: 18,
      }}
    >
      {on ? '♪' : '♪'}
      <span style={{
        position: 'absolute', width: on ? 0 : '120%', height: 2,
        background: 'rgba(255,255,255,0.7)', borderRadius: 2,
        transform: 'rotate(-45deg)', transition: 'width 0.2s',
        pointerEvents: 'none',
      }} />
    </button>
  )
}
