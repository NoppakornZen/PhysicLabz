// ===== INTERNATIONALIZATION (i18n) =====
// Bilingual support: Thai (th) and English (en)

export type Language = 'th' | 'en'

const STORAGE_KEY = 'physics-playlab-lang'

// Detect browser locale, default to Thai for TH browsers, English otherwise
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'th'

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'th' || stored === 'en') return stored

  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('th') ? 'th' : 'en'
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'th'
  const stored = localStorage.getItem(STORAGE_KEY)
  return (stored === 'th' || stored === 'en') ? stored : detectLanguage()
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, lang)
}

// Translation type
export type Translations = Record<string, { th: string; en: string }>

// Get translated text
export function t(key: string, translations: Translations, lang?: Language): string {
  const currentLang = lang ?? getLanguage()
  return translations[key]?.[currentLang] ?? translations[key]?.th ?? key
}

// Common UI translations
export const COMMON: Translations = {
  // Navigation
  'nav.login': { th: 'เข้าสู่ระบบ', en: 'Login' },
  'nav.signup': { th: 'สมัครฟรี', en: 'Sign Up Free' },
  'nav.logout': { th: 'ออกจากระบบ', en: 'Logout' },
  'nav.back': { th: 'กลับ', en: 'Back' },
  'nav.next': { th: 'ถัดไป', en: 'Next' },
  'nav.continue': { th: 'ดำเนินการต่อ', en: 'Continue' },

  // Actions
  'action.start': { th: 'เริ่ม', en: 'Start' },
  'action.pause': { th: 'หยุดชั่วคราว', en: 'Pause' },
  'action.resume': { th: 'เล่นต่อ', en: 'Resume' },
  'action.reset': { th: 'รีเซ็ต', en: 'Reset' },
  'action.submit': { th: 'ส่งคำตอบ', en: 'Submit' },
  'action.retry': { th: 'ลองอีกครั้ง', en: 'Try Again' },
  'action.close': { th: 'ปิด', en: 'Close' },

  // Loading states
  'loading.wait': { th: 'รอแป๊บนึง', en: 'Please wait...' },
  'loading.loading': { th: 'กำลังโหลด...', en: 'Loading...' },

  // Audio
  'audio.turnOn': { th: 'เปิดเพลง', en: 'Turn on music' },
  'audio.turnOff': { th: 'ปิดเพลง', en: 'Turn off music' },

  // Auth
  'auth.email': { th: 'อีเมล', en: 'Email' },
  'auth.password': { th: 'รหัสผ่าน', en: 'Password' },
  'auth.name': { th: 'ชื่อ', en: 'Name' },
  'auth.signin': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'auth.signup': { th: 'สมัครสมาชิก', en: 'Sign Up' },
  'auth.google': { th: 'เข้าสู่ระบบด้วย Google', en: 'Sign in with Google' },
  'auth.or': { th: 'หรือ', en: 'or' },

  // Errors
  'error.generic': { th: 'มีบางอย่างผิดพลาด ลองใหม่ดูนะ', en: 'Something went wrong. Please try again.' },
  'error.required': { th: 'กรุณากรอกข้อมูลให้ครบ', en: 'Please fill in all required fields' },
  'error.network': { th: 'ไม่สามารถเชื่อมต่อได้ ตรวจสอบอินเทอร์เน็ตของคุณ', en: 'Connection failed. Please check your internet.' },

  // Status
  'status.locked': { th: 'ล็อคอยู่', en: 'Locked' },
  'status.unlocked': { th: 'ปลดล็อคแล้ว', en: 'Unlocked' },
  'status.completed': { th: 'เสร็จสิ้น', en: 'Completed' },
  'status.inProgress': { th: 'กำลังเรียน', en: 'In Progress' },

  // Quiz
  'quiz.correct': { th: 'ถูกต้อง!', en: 'Correct!' },
  'quiz.incorrect': { th: 'ไม่ถูกต้อง', en: 'Incorrect' },
  'quiz.explanation': { th: 'คำอธิบาย', en: 'Explanation' },
  'quiz.score': { th: 'คะแนน', en: 'Score' },
  'quiz.stars': { th: 'ดาว', en: 'Stars' },
  'quiz.combo': { th: 'Combo', en: 'Combo' },
  'quiz.fever': { th: 'FEVER!!', en: 'FEVER!!' },

  // Camera
  'camera.optional': { th: 'การใช้กล้องเป็นตัวเลือก', en: 'Camera is optional' },
  'camera.handTracking': { th: 'Hand Tracking', en: 'Hand Tracking' },
  'camera.enable': { th: 'เปิดใช้งานกล้อง', en: 'Enable Camera' },
  'camera.disable': { th: 'ปิดกล้อง', en: 'Disable Camera' },
  'camera.notAvailable': { th: 'กล้องไม่พร้อมใช้งาน', en: 'Camera not available' },
  'camera.useNormalControls': { th: 'ใช้ปุ่มควบคุมปกติได้', en: 'Use normal controls' },
}
