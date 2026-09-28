// ===== LOBBY PAGE TRANSLATIONS =====
import type { Translations } from '@/lib/i18n'

export const LOBBY: Translations = {
  // Header
  'lobby.welcome': { th: 'ยินดีต้อนรับ', en: 'Welcome' },
  'lobby.welcomeBack': { th: 'กลับมาแล้ว ไปต่อกันได้เลย!', en: 'is back! Let\'s continue!' },
  'lobby.selectIsland': { th: 'เลือกเกาะที่อยากลองก่อนได้เลย', en: 'Choose an island to start!' },
  'lobby.newUnlock': { th: 'เกาะใหม่ unlock แล้ว! ไปลองดูกัน!', en: 'New island unlocked! Let\'s try it!' },
  'lobby.logout': { th: 'ออกจากระบบ', en: 'Logout' },
  'lobby.logoutShort': { th: 'ออก', en: 'Logout' },
  'lobby.mapTitle': { th: 'แผนที่โลกฟิสิกส์', en: 'Physics World Map' },
  'lobby.continue': { th: 'ไปต่อ!', en: 'Continue!' },
  'lobby.close': { th: 'ปิด', en: 'Close' },

  // Island status
  'lobby.status.locked': { th: 'ล็อคอยู่', en: 'Locked' },
  'lobby.status.available': { th: 'พร้อมเรียน', en: 'Available' },
  'lobby.status.inProgress': { th: 'กำลังเรียน', en: 'In Progress' },
  'lobby.status.completed': { th: 'เสร็จสิ้น', en: 'Completed' },

  // Actions
  'lobby.action.continue': { th: 'เรียนต่อ', en: 'Continue' },
  'lobby.action.start': { th: 'เริ่มเรียน', en: 'Start' },
  'lobby.action.review': { th: 'ทบทวน', en: 'Review' },
  'lobby.action.unlock': { th: 'ปลดล็อค', en: 'Unlock' },

  // Progress
  'lobby.progress.learn': { th: 'Learn', en: 'Learn' },
  'lobby.progress.lab': { th: 'Lab', en: 'Lab' },
  'lobby.progress.quiz': { th: 'Quiz', en: 'Quiz' },
  'lobby.progress.score': { th: 'คะแนน', en: 'Score' },
  'lobby.progress.stars': { th: 'ดาว', en: 'Stars' },

  // Unlock requirements
  'lobby.unlock.requirement': { th: 'ต้องจบ', en: 'Complete' },
  'lobby.unlock.first': { th: 'ก่อน', en: 'first' },

  // Detail panel and sandbox
  'lobby.sandbox.description': {
    th: 'เปิดกล้อง ใช้มือหยิบ object ได้โดยตรง — เห็นแรง, ความเร็ว, พลังงาน ทำงานแบบ real-time',
    en: 'Enable the camera and grab objects with your hands — see force, velocity, and energy in real time',
  },
  'lobby.sandbox.start': { th: 'เริ่มทดลอง', en: 'Start Experiment' },
  'lobby.mode.learnDescription': { th: 'เรียนรู้เนื้อหาและสูตร', en: 'Learn concepts and formulas' },
  'lobby.mode.labDescription': { th: 'ทดลองจำลองฟิสิกส์จริง', en: 'Run a real physics simulation' },
  'lobby.mode.quizDescription': { th: 'ทดสอบ 10 ข้อ · ปักธงเมื่อได้ 8+', en: '10 questions · plant a flag at 8+' },
  'lobby.progress.title': { th: 'ความคืบหน้า', en: 'Progress' },
  'lobby.progress.done': { th: 'สำเร็จ', en: 'Done' },
  'lobby.progress.notStarted': { th: 'ยังไม่ได้ทำ', en: 'Not started' },
  'lobby.progress.islands': { th: 'เกาะ', en: 'islands' },
  'lobby.progress.starsLabel': { th: 'ดาว', en: 'stars' },

  // Time of day
  'lobby.time.dawn': { th: 'รุ่งอรุณ', en: 'Dawn' },
  'lobby.time.day': { th: 'กลางวัน', en: 'Day' },
  'lobby.time.dusk': { th: 'เย็น', en: 'Dusk' },
  'lobby.time.night': { th: 'กลางคืน', en: 'Night' },
}
