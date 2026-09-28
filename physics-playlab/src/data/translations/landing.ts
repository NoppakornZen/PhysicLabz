// ===== LANDING PAGE TRANSLATIONS =====
import type { Translations } from '@/lib/i18n'

export const LANDING: Translations = {
  // Nav
  'landing.nav.login': { th: 'เข้าสู่ระบบ', en: 'Login' },
  'landing.nav.signupFree': { th: 'สมัครฟรี', en: 'Sign Up Free' },

  // Hero
  'landing.hero.kicker': { th: 'physics education platform', en: 'physics education platform' },
  'landing.hero.title.learn': { th: 'เรียน', en: 'Learn' },
  'landing.hero.title.physics': { th: 'ฟิสิกส์', en: 'Physics' },
  'landing.hero.title.byDoing': { th: 'ด้วยการลงมือเล่น', en: 'By Doing' },
  'landing.hero.subtitle': {
    th: 'ทดลองสูตร ดูกราฟแบบเรียลไทม์ ทำโจทย์ที่รู้สึกเหมือนเกม — ไม่ใช่แค่ท่องจำ',
    en: 'Experiment with formulas, see real-time graphs, solve problems that feel like a game — not just memorization',
  },
  'landing.hero.cta.start': { th: 'เริ่มเรียนฟรี', en: 'Start Learning Free' },
  'landing.hero.cta.login': { th: 'เข้าสู่ระบบ', en: 'Login' },
  'landing.hero.cta.demo': { th: 'ทดลองเล่น', en: 'Try Demo' },
  'landing.hero.scroll': { th: 'scroll', en: 'scroll' },

  // Modes Section
  'landing.modes.heading': { th: 'สามโหมด สามวิธีเรียน', en: 'Three Modes, Three Ways to Learn' },

  // Mode 1: Learn
  'landing.mode.learn.label': { th: '01 · Learn', en: '01 · Learn' },
  'landing.mode.learn.title': { th: 'อ่านน้อย เข้าใจมาก', en: 'Read Less, Understand More' },
  'landing.mode.learn.body': {
    th: 'เนื้อหาที่เล่าเรื่องได้ ไม่ใช่แค่ list สูตร — ทุก concept มี visual และตัวอย่างโจทย์ที่คิดตาม',
    en: 'Content that tells a story, not just formula lists — every concept has visuals and worked examples',
  },

  // Mode 2: Lab
  'landing.mode.lab.label': { th: '02 · Lab', en: '02 · Lab' },
  'landing.mode.lab.title': { th: 'ทดลองได้เลย ไม่ต้องรอ', en: 'Experiment Instantly' },
  'landing.mode.lab.body': {
    th: 'ขยับ slider เห็นกราฟเปลี่ยนทันที — เหมือน lab จริงแต่ไม่ต้องกลัวเครื่องพัง',
    en: 'Move a slider, see the graph change instantly — like a real lab, but nothing breaks',
  },

  // Mode 3: Quiz
  'landing.mode.quiz.label': { th: '03 · Quiz', en: '03 · Quiz' },
  'landing.mode.quiz.title': { th: 'รู้จริงหรือแค่จำ?', en: 'Real Knowledge or Just Memory?' },
  'landing.mode.quiz.body': {
    th: 'โจทย์ที่ทดสอบความเข้าใจ ไม่ใช่แค่แทนค่า — เฉลยทันทีพร้อมอธิบาย',
    en: 'Problems that test understanding, not just plug-and-chug — instant feedback with explanations',
  },
  'landing.mode.quiz.question': {
    th: 'ลูกบอลตกจากที่สูง 20 m จะใช้เวลา?',
    en: 'A ball falls from 20 m height. How long does it take?',
  },
  'landing.mode.quiz.correct': { th: 'ถูกต้อง!', en: 'Correct!' },

  // Islands Section
  'landing.islands.heading': { th: 'หัวข้อที่รอคุณอยู่', en: 'Topics Waiting for You' },
  'landing.islands.lessons': { th: 'บท', en: 'lessons' },

  // Bottom CTA
  'landing.cta.title': {
    th: 'พร้อมจะเข้าใจฟิสิกส์ในแบบที่ไม่เคยได้ลองหรือยัง?',
    en: 'Ready to understand physics like never before?',
  },
  'landing.cta.subtitle': {
    th: 'ฟรี ไม่ต้องใช้บัตรเครดิต เริ่มได้เลยตอนนี้',
    en: 'Free, no credit card required, start right now',
  },
  'landing.cta.signup': { th: 'สมัครสมาชิกฟรี', en: 'Sign Up Free' },
  'landing.cta.hasAccount': { th: 'มีบัญชีอยู่แล้ว', en: 'Already Have an Account' },

  // Footer
  'landing.footer.copyright': { th: '© 2026 Physics PlayLab', en: '© 2026 Physics PlayLab' },
  'landing.footer.tagline': { th: 'ฟิสิกส์ไม่ยากอย่างที่คิด', en: 'Physics isn\'t as hard as you think' },
}
