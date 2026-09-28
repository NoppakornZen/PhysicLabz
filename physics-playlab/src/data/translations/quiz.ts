// ===== QUIZ PAGE TRANSLATIONS =====
import type { Translations } from '@/lib/i18n'

export const QUIZ: Translations = {
  // Header
  'quiz.ready': { th: 'พร้อมแล้วใช่ไหม ลุยเลย!', en: 'Ready? Let\'s go!' },
  'quiz.lastQuestion': { th: 'ข้อสุดท้าย!! เตรียมตัวให้ดีนะ...', en: 'Last question!! Get ready...' },

  // Responses
  'quiz.correct.1': { th: 'ใช่เลย!', en: 'Exactly!' },
  'quiz.correct.2': { th: 'นั่นแหละ!', en: 'That\'s it!' },
  'quiz.correct.3': { th: 'โห รู้เรื่องนี้ด้วย!', en: 'Wow, you know this!' },
  'quiz.correct.4': { th: 'เยี่ยมมาก!', en: 'Excellent!' },
  'quiz.streak.2': { th: '2 ติดแล้ว!', en: '2 in a row!' },
  'quiz.streak.3': { th: '3 ติดแล้ว โห!', en: '3 in a row! Wow!' },
  'quiz.streak.4': { th: '4 ติด โหดมากเลย!', en: '4 in a row! Amazing!' },
  'quiz.fever': { th: 'FEVER!! ร้อนมาก!', en: 'FEVER!! On fire!' },
  'quiz.wrong': { th: 'อุ๊ย ยังไม่ใช่ —', en: 'Oops, not quite —' },
  'quiz.streakBroken': { th: 'โอ้ streak หักแล้ว...', en: 'Oh, streak broken...' },

  // Navigation
  'quiz.next': { th: 'ข้อถัดไป', en: 'Next Question' },
  'quiz.finish': { th: 'ดูผล', en: 'See Results' },
  'quiz.back': { th: 'กลับ', en: 'Back' },

  // Results
  'quiz.result.title': { th: 'ผลคะแนน', en: 'Your Score' },
  'quiz.result.score': { th: 'คะแนน', en: 'Score' },
  'quiz.result.outOf': { th: 'จาก', en: 'out of' },
  'quiz.result.perfect': { th: 'สุดยอด! คุณตอบถูกทุกข้อ!', en: 'Perfect! You got them all!' },
  'quiz.result.great': { th: 'เก่งมาก! เข้าใจดีแล้ว!', en: 'Great job! You understand well!' },
  'quiz.result.good': { th: 'ดีมาก! ลองทบทวนดูอีกนิดนะ', en: 'Good work! Review a bit more' },
  'quiz.result.needPractice': { th: 'ต้องฝึกอีกนิดนะ ลองอ่านเนื้อหาอีกครั้ง', en: 'Need more practice. Try reviewing the content' },
  'quiz.result.retry': { th: 'ลองอีกครั้ง', en: 'Try Again' },
  'quiz.result.continue': { th: 'ไปต่อ', en: 'Continue' },
  'quiz.result.backToLobby': { th: 'กลับหน้าหลัก', en: 'Back to Lobby' },

  // Stars
  'quiz.stars.earned': { th: 'ได้', en: 'Earned' },
  'quiz.stars.label': { th: 'ดาว', en: 'Stars' },

  // Combo
  'quiz.combo': { th: 'COMBO', en: 'COMBO' },
  'quiz.comboX': { th: 'COMBO ×', en: 'COMBO ×' },
}
