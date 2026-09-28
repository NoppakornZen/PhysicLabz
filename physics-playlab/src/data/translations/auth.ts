// ===== AUTH PAGE TRANSLATIONS =====
import type { Translations } from '@/lib/i18n'

export const AUTH: Translations = {
  // Page title
  'auth.title': { th: 'Physics PlayLab', en: 'Physics PlayLab' },
  'auth.subtitle': {
    th: 'ฟิสิกส์ไม่ยากอย่างที่คิด — มาลองดูด้วยกัน',
    en: 'Physics isn\'t as hard as you think — let\'s try together',
  },

  // Mascot speech
  'auth.mascot.welcome': {
    th: 'เฮ้! นูโตะอยู่นี่เอง ฟิสิกส์ไม่ได้น่ากลัวอย่างที่คิดนะ',
    en: 'Hey! Nuto here! Physics isn\'t scary at all',
  },

  // Tabs
  'auth.tab.signin': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'auth.tab.signup': { th: 'สมัครสมาชิก', en: 'Sign Up' },

  // Form fields
  'auth.field.name': { th: 'ชื่อเล่นหรือชื่อจริงก็ได้', en: 'Nickname or real name' },
  'auth.field.email': { th: 'อีเมล', en: 'Email' },
  'auth.field.password': { th: 'รหัสผ่าน อย่างน้อย 6 ตัว', en: 'Password (at least 6 characters)' },

  // Buttons
  'auth.button.signup': { th: 'สมัครแล้วเริ่มเลย', en: 'Sign Up and Start' },
  'auth.button.signin': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'auth.button.google': { th: 'เข้าสู่ระบบด้วย Google', en: 'Sign in with Google' },
  'auth.button.loading': { th: 'รอแป๊บนึง', en: 'Please wait...' },

  // Post-login animation
  'auth.welcomeAnimation.welcome': { th: 'ยินดีต้อนรับ', en: 'Welcome' },
  'auth.welcomeAnimation.sub': { th: 'กำลังพาไปยังเกาะฟิสิกส์...', en: 'Taking you to the Physics Islands...' },

  // Divider
  'auth.divider': { th: 'หรือ', en: 'or' },

  // Errors
  'auth.error.emailInUse': { th: 'อีเมลนี้ถูกใช้แล้ว', en: 'This email is already in use' },
  'auth.error.invalidEmail': { th: 'รูปแบบอีเมลไม่ถูกต้อง', en: 'Invalid email format' },
  'auth.error.weakPassword': { th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', en: 'Password must be at least 6 characters' },
  'auth.error.userNotFound': { th: 'ไม่พบบัญชีนี้', en: 'Account not found' },
  'auth.error.wrongPassword': { th: 'รหัสผ่านไม่ถูกต้อง', en: 'Wrong password' },
  'auth.error.invalidCredential': { th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', en: 'Invalid email or password' },
  'auth.error.generic': { th: 'มีบางอย่างผิดพลาด ลองใหม่ดูนะ', en: 'Something went wrong. Please try again.' },
  'auth.error.required': { th: 'กรุณากรอกข้อมูลให้ครบ', en: 'Please fill in all required fields' },
  'auth.error.nameRequired': { th: 'กรุณาใส่ชื่อของคุณ', en: 'Please enter your name' },
}
