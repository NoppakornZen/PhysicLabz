'use client'
import Link from 'next/link'
import { MAIN_ISLANDS } from '@/data/islands'
import styles from './page.module.css'

const ISLAND_EMOJIS: Record<string, string> = {
  'straight-motion': '→',
  'newton-laws': 'F',
}

const ISLAND_GLOW: Record<string, string> = {
  'straight-motion': 'rgba(76, 175, 80, 0.45)',
  'newton-laws': 'rgba(26, 127, 160, 0.45)',
}

const FLOATING_FORMULAS = [
  { text: 'F = ma', top: '18%', left: '8%', size: '2.2rem', delay: '0s' },
  { text: 'v = u + at', top: '72%', left: '6%', size: '1.4rem', delay: '-4s' },
  { text: 'E = ½mv²', top: '25%', right: '7%', size: '1.7rem', delay: '-2s' },
  { text: 'a = Δv/Δt', top: '65%', right: '9%', size: '1.3rem', delay: '-7s' },
  { text: 's = ut + ½at²', top: '45%', left: '4%', size: '1.1rem', delay: '-3s' },
  { text: 'F = -kx', top: '50%', right: '5%', size: '1.2rem', delay: '-5.5s' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.scanLine} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="18" fill="#4caf50" />
            <path d="M10 22 Q18 8 26 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="18" cy="24" r="3" fill="white" />
          </svg>
          <span className={styles.navLogoText}>
            <span>Physics</span>PlayLab
          </span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>เข้าสู่ระบบ</Link>
          <Link href="/login" className={`${styles.navLink} ${styles['navLink--solid']}`}>สมัครฟรี</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="hero">
        <div className={`${styles.heroCorner} ${styles['heroCorner--tl']}`} aria-hidden="true" />
        <div className={`${styles.heroCorner} ${styles['heroCorner--tr']}`} aria-hidden="true" />
        <div className={`${styles.heroCorner} ${styles['heroCorner--bl']}`} aria-hidden="true" />
        <div className={`${styles.heroCorner} ${styles['heroCorner--br']}`} aria-hidden="true" />

        {FLOATING_FORMULAS.map((f, i) => (
          <div
            key={i}
            className={styles.heroFloat}
            aria-hidden="true"
            style={{
              top: f.top,
              left: 'left' in f ? f.left : undefined,
              right: 'right' in f ? (f as any).right : undefined,
              fontSize: f.size,
              animationDelay: f.delay,
              animationDuration: `${12 + i * 2.5}s`,
            }}
          >
            {f.text}
          </div>
        ))}

        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>physics education platform</p>
          <h1 className={styles.heroTitle}>
            เรียน<span className={styles.heroTitleAccent}>ฟิสิกส์</span><br />
            ด้วยการลงมือเล่น
          </h1>
          <p className={styles.heroSub}>
            ทดลองสูตร ดูกราฟแบบเรียลไทม์ ทำโจทย์ที่รู้สึกเหมือนเกม — ไม่ใช่แค่ท่องจำ
          </p>
          <div className={styles.heroCta}>
            <Link href="/login" className={styles.ctaSolid}>
              เริ่มเรียนฟรี
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" className={styles.ctaOutline}>เข้าสู่ระบบ</Link>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <div className={styles.scrollArrow} />
          <span>scroll</span>
        </div>
      </section>

      {/* ── Modes section ── */}
      <section className={styles.modesSection} aria-labelledby="modesHeading">
        <div className={styles.modesSectionHead}>
          <h2 id="modesHeading">สามโหมด สามวิธีเรียน</h2>
          <div className={styles.modesLine} aria-hidden="true" />
        </div>

        {/* Panel 1: LEARN — terminal readout */}
        <div className={styles.modeLearn}>
          <div className={styles.modeLearnLeft}>
            <p className={`${styles.modeName} ${styles['modeName--learn']}`}>01 · Learn</p>
            <h3 className={styles.modeTitle}>อ่านน้อย เข้าใจมาก</h3>
            <p className={styles.modeBody}>
              เนื้อหาที่เล่าเรื่องได้ ไม่ใช่แค่ list สูตร — ทุก concept มี visual และตัวอย่างโจทย์ที่คิดตาม
            </p>
          </div>
          <div className={styles.modeLearnRight} aria-hidden="true">
            {[
              ['>', 'v = u + at', '// velocity over time'],
              ['>', 'F = ma', '// Newton\'s second law'],
              ['>', 's = ut + ½at²', '// displacement'],
              ['>', 'v² = u² + 2as', '// no time needed'],
              ['_', '', ''],
            ].map(([prompt, formula, comment], i) => (
              <div key={i} className={styles.termLine}>
                <span className={styles.termPrompt}>{prompt}</span>
                <span className={styles.termFormula}>{formula}</span>
                <span className={styles.termComment}>{comment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: LAB — oscilloscope, amber, RTL-flipped */}
        <div className={styles.modeLab}>
          <div className={styles.modeLabLeft}>
            <p className={`${styles.modeName} ${styles['modeName--lab']}`}>02 · Lab</p>
            <h3 className={styles.modeTitle}>ทดลองได้เลย ไม่ต้องรอ</h3>
            <p className={styles.modeBody}>
              ขยับ slider เห็นกราฟเปลี่ยนทันที — เหมือน lab จริงแต่ไม่ต้องกลัวเครื่องพัง
            </p>
          </div>
          <div className={styles.modeLabRight} aria-hidden="true">
            <svg className={styles.oscWave} viewBox="0 0 220 120" preserveAspectRatio="none">
              {/* Grid */}
              <line x1="0" y1="60" x2="220" y2="60" stroke="rgba(255,167,38,0.15)" strokeWidth="1" />
              <line x1="0" y1="30" x2="220" y2="30" stroke="rgba(255,167,38,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="0" y1="90" x2="220" y2="90" stroke="rgba(255,167,38,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="55" y1="0" x2="55" y2="120" stroke="rgba(255,167,38,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="110" y1="0" x2="110" y2="120" stroke="rgba(255,167,38,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="165" y1="0" x2="165" y2="120" stroke="rgba(255,167,38,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              {/* Sine wave */}
              <path
                d="M0,60 C14,60 18,20 28,20 C38,20 42,100 55,100 C68,100 72,20 83,20 C93,20 98,100 110,100 C122,100 127,20 138,20 C148,20 152,100 165,100 C178,100 182,20 193,20 C203,20 207,60 220,60"
                fill="none"
                stroke="rgba(255,167,38,0.8)"
                strokeWidth="2"
              />
              {/* Dot on wave */}
              <circle cx="83" cy="20" r="3" fill="#ffa726" />
            </svg>
          </div>
        </div>

        {/* Panel 3: QUIZ */}
        <div className={styles.modeQuiz}>
          <div className={styles.modeQuizHeader}>
            <div className={styles.quizDot} />
            <div className={styles.quizDot} />
            <div className={styles.quizDot} />
            <span className={styles.quizTermTitle}>quiz.exe</span>
          </div>
          <div className={styles.modeQuizBody}>
            <div className={styles.modeQuizLeft}>
              <p className={`${styles.modeName} ${styles['modeName--quiz']}`}>03 · Quiz</p>
              <h3 className={styles.modeTitle}>รู้จริงหรือแค่จำ?</h3>
              <p className={styles.modeBody}>
                โจทย์ที่ทดสอบความเข้าใจ ไม่ใช่แค่แทนค่า — เฉลยทันทีพร้อมอธิบาย
              </p>
            </div>
            <div className={styles.modeQuizRight} aria-hidden="true">
              <span className={styles.quizQuestion}>&gt; ลูกบอลตกจากที่สูง 20 m จะใช้เวลา?</span>
              <span className={styles.quizOption}>  A) 1.0 s</span>
              <span className={styles.quizOption}>  B) 1.5 s</span>
              <span className={`${styles.quizOption} ${styles.quizSelected}`}>  C) 2.0 s ◀</span>
              <span className={styles.quizOption}>  D) 2.5 s</span>
              <span className={styles.quizResult}>  ✓ ถูกต้อง! h = ½gt²</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Islands section ── */}
      <section className={styles.islandsSection} aria-labelledby="islandsHeading">
        <div className={styles.islandsSectionHead}>
          <h2 id="islandsHeading">หัวข้อที่รอคุณอยู่</h2>
          <div className={styles.islandsLine} aria-hidden="true" />
        </div>
        <div className={styles.islandsTrack}>
          {MAIN_ISLANDS.map((island) => (
            <div
              key={island.id}
              className={styles.islandNode}
              style={{ '--island-glow': ISLAND_GLOW[island.id] ?? 'rgba(0,229,255,0.4)' } as React.CSSProperties}
            >
              <div
                className={styles.islandNodeDot}
                style={{ borderColor: island.color, color: island.color }}
                aria-hidden="true"
              >
                {ISLAND_EMOJIS[island.id] ?? '●'}
              </div>
              <div className={styles.islandNodeInfo}>
                <p className={styles.islandNodeName}>{island.name}</p>
                <p className={styles.islandNodeEn}>{island.nameEn}</p>
                <p className={styles.islandNodeDesc}>{island.description}</p>
                <span className={styles.islandNodeCount}>{island.subIslands.length} บท</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.ctaSection} aria-labelledby="ctaHeading">
        <h2 id="ctaHeading" className={styles.ctaTitle}>
          พร้อมจะเข้าใจฟิสิกส์<br />ในแบบที่ไม่เคยได้ลองหรือยัง?
        </h2>
        <p className={styles.ctaSub}>ฟรี ไม่ต้องใช้บัตรเครดิต เริ่มได้เลยตอนนี้</p>
        <div className={styles.ctaButtons}>
          <Link href="/login" className={styles.ctaSolid}>
            สมัครสมาชิกฟรี
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/login" className={styles.ctaOutline}>มีบัญชีอยู่แล้ว</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerText}>© 2026 Physics PlayLab</span>
        <span className={styles.footerText}>ฟิสิกส์ไม่ยากอย่างที่คิด</span>
      </footer>
    </div>
  )
}