// ===== ISLAND DATA =====
import type { Language } from '@/lib/i18n'

export interface SubIsland {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  emoji: string // for internal use, rendered as SVG icon
  mainIslandId: string
  order: number
  unlockRequires: string | null // sub-island id that must be completed first
}

export interface MainIsland {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  color: string
  subIslands: SubIsland[]
}

// Helper to get localized island name
export function getIslandName(island: MainIsland | SubIsland, lang: Language): string {
  return lang === 'en' ? island.nameEn : island.name
}

// Helper to get localized island description
export function getIslandDescription(island: MainIsland | SubIsland, lang: Language): string {
  return lang === 'en' ? island.descriptionEn : island.description
}

export const MAIN_ISLANDS: MainIsland[] = [
  {
    id: 'straight-motion',
    name: 'การเคลื่อนที่แนวตรง',
    nameEn: 'Straight Motion',
    description: 'รถ ลูกบอล คน — ทุกอย่างเคลื่อนที่ และมีสูตรคุมอยู่',
    descriptionEn: 'Cars, balls, people — everything moves, and formulas govern it',
    color: '#4caf50',
    subIslands: [
      {
        id: 'horizontal-motion',
        name: 'การเคลื่อนที่แนวราบ',
        nameEn: 'Horizontal Motion',
        description: 'วิ่งเร็วแค่ไหน ไปได้ไกลแค่ไหน — คำนวณได้หมด',
        descriptionEn: 'How fast, how far — all calculable',
        emoji: 'horizontal',
        mainIslandId: 'straight-motion',
        order: 1,
        unlockRequires: null,
      },
      {
        id: 'vertical-motion',
        name: 'การเคลื่อนที่แนวดิ่ง',
        nameEn: 'Vertical Motion',
        description: 'โยนขึ้น ตกลง — โน้มถ่วงไม่เคยหยุดดึง',
        descriptionEn: 'Throw up, fall down — gravity never stops pulling',
        emoji: 'vertical',
        mainIslandId: 'straight-motion',
        order: 2,
        unlockRequires: 'horizontal-motion',
      },
      {
        id: 'projectile-motion',
        name: 'การเคลื่อนที่แบบโปรเจคไทล์',
        nameEn: 'Projectile Motion',
        description: 'ยิงปืน โยนลูกบอล — วิถีโค้งที่คำนวณได้',
        descriptionEn: 'Fire a cannon, throw a ball — predictable curved paths',
        emoji: 'projectile',
        mainIslandId: 'straight-motion',
        order: 3,
        unlockRequires: 'vertical-motion',
      },
    ],
  },
  {
    id: 'newton-laws',
    name: 'แรงและกฎของแรง',
    nameEn: 'Forces & Newton Laws',
    description: 'ทำไมของถึงเคลื่อนที่? นิวตันมีคำตอบ',
    descriptionEn: 'Why do things move? Newton has the answer',
    color: '#1a7fa0',
    subIslands: [
      {
        id: 'newton-1',
        name: 'กฎนิวตันข้อ 1',
        nameEn: 'Newton\'s First Law',
        description: 'ของที่หยุดนิ่งจะหยุดอยู่ — จนกว่าจะมีอะไรมาดัน',
        descriptionEn: 'What stops stays stopped — until something pushes it',
        emoji: 'newton1',
        mainIslandId: 'newton-laws',
        order: 1,
        unlockRequires: null,
      },
      {
        id: 'newton-2',
        name: 'กฎนิวตันข้อ 2',
        nameEn: 'Newton\'s Second Law',
        description: 'F = ma สูตรนี้ใช้ได้กับเกือบทุกอย่างในชีวิต',
        descriptionEn: 'F = ma — this formula works for almost everything in life',
        emoji: 'newton2',
        mainIslandId: 'newton-laws',
        order: 2,
        unlockRequires: 'newton-1',
      },
      {
        id: 'newton-3',
        name: 'กฎนิวตันข้อ 3',
        nameEn: 'Newton\'s Third Law',
        description: 'ผลัก 1 ครั้ง เจอแรงสวนกลับ 1 ครั้งเสมอ',
        descriptionEn: 'Push once, get pushed back once — always',
        emoji: 'newton3',
        mainIslandId: 'newton-laws',
        order: 3,
        unlockRequires: 'newton-2',
      },
    ],
  },
]

export const ALL_SUB_ISLANDS: SubIsland[] = MAIN_ISLANDS.flatMap(m => m.subIslands)

export function getSubIsland(id: string): SubIsland | undefined {
  return ALL_SUB_ISLANDS.find(s => s.id === id)
}

export function getMainIsland(id: string): MainIsland | undefined {
  return MAIN_ISLANDS.find(m => m.id === id)
}
