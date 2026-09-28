'use client'

export default function OceanWave() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      zIndex: 3,
      pointerEvents: 'none',
      overflow: 'hidden',
    }} aria-hidden="true">
      {/* Back wave */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '200%',
          height: '100%',
          animation: 'waveSlide 8s linear infinite',
          opacity: 0.35,
        }}
      >
        <path
          d="M0,60 C180,100 360,20 540,60 C720,100 900,20 1080,60 C1260,100 1440,20 1440,60 L1440,120 L0,120 Z"
          fill="rgba(30,160,130,0.6)"
        />
      </svg>

      {/* Front wave */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '200%',
          height: '85%',
          animation: 'waveSlide 5.5s linear infinite reverse',
          opacity: 0.55,
        }}
      >
        <path
          d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,120 L0,120 Z"
          fill="rgba(20,140,120,0.5)"
        />
      </svg>

      {/* Foam top line */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: '70%',
          width: '200%',
          height: 40,
          animation: 'waveSlide 6s linear infinite',
          opacity: 0.22,
        }}
      >
        <path
          d="M0,20 C120,35 240,5 360,20 C480,35 600,5 720,20 C840,35 960,5 1080,20 C1200,35 1320,5 1440,20"
          fill="none"
          stroke="rgba(180,255,235,0.9)"
          strokeWidth="2"
        />
      </svg>

      <style>{`
        @keyframes waveSlide {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
