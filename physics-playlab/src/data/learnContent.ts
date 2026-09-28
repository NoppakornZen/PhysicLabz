// ===== LEARN CONTENT DATA =====
import type { Language } from '@/lib/i18n'

export interface Formula {
  expression: string
  variables: { symbol: string; meaning: string; meaningEn: string }[]
  unit?: string
}

export interface Example {
  problem: string
  problemEn: string
  given: { label: string; labelEn: string; value: string }[]
  solution: string[]
  solutionEn: string[]
  answer: string
  answerEn: string
}

export interface LearnContent {
  islandId: string
  title: string
  titleEn: string
  concept: string[]
  conceptEn: string[]
  formulas: Formula[]
  example: Example
  mascotLines: string[]
  mascotLinesEn: string[]
}

// Helper to get localized content
export function getLocalizedLearnContent(content: LearnContent, lang: Language) {
  return {
    title: lang === 'en' ? content.titleEn : content.title,
    concept: lang === 'en' ? content.conceptEn : content.concept,
    formulas: content.formulas.map(f => ({
      ...f,
      variables: f.variables.map(v => ({
        symbol: v.symbol,
        meaning: lang === 'en' ? v.meaningEn : v.meaning,
      })),
    })),
    example: {
      problem: lang === 'en' ? content.example.problemEn : content.example.problem,
      given: content.example.given.map(g => ({
        label: lang === 'en' ? g.labelEn : g.label,
        value: g.value,
      })),
      solution: lang === 'en' ? content.example.solutionEn : content.example.solution,
      answer: lang === 'en' ? content.example.answerEn : content.example.answer,
    },
    mascotLines: lang === 'en' ? content.mascotLinesEn : content.mascotLines,
  }
}

export const LEARN_CONTENT: LearnContent[] = [
  {
    islandId: 'horizontal-motion',
    title: 'การเคลื่อนที่แนวราบ',
    titleEn: 'Horizontal Motion',
    concept: [
      'การเคลื่อนที่แนวราบ คือการเคลื่อนที่ของวัตถุบนพื้นราบในแนวเส้นตรง โดยอาจมีหรือไม่มีความเร่งก็ได้',
      'ถ้าความเร่งเป็นศูนย์ วัตถุจะเคลื่อนที่ด้วยความเร็วคงที่ (Uniform Motion)',
      'ถ้ามีความเร่งคงที่ ความเร็วจะเปลี่ยนแปลงเป็นเส้นตรงตามเวลา (Uniformly Accelerated Motion)',
    ],
    conceptEn: [
      'Horizontal motion is the movement of an object on a flat surface in a straight line, with or without acceleration.',
      'If acceleration is zero, the object moves with constant velocity (Uniform Motion).',
      'If there is constant acceleration, velocity changes linearly with time (Uniformly Accelerated Motion).',
    ],
    formulas: [
      {
        expression: 'v = u + at',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)', meaningEn: 'final velocity (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
          { symbol: 't', meaning: 'เวลา (s)', meaningEn: 'time (s)' },
        ],
      },
      {
        expression: 's = ut + ½at²',
        variables: [
          { symbol: 's', meaning: 'ระยะทาง (m)', meaningEn: 'distance (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
          { symbol: 't', meaning: 'เวลา (s)', meaningEn: 'time (s)' },
        ],
      },
      {
        expression: 'v² = u² + 2as',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)', meaningEn: 'final velocity (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
          { symbol: 's', meaning: 'ระยะทาง (m)', meaningEn: 'distance (m)' },
        ],
      },
    ],
    example: {
      problem: 'รถยนต์เริ่มต้นจากหยุดนิ่ง เร่งความเร็วด้วยความเร่ง 3 m/s² เป็นเวลา 5 วินาที รถวิ่งได้ระยะทางเท่าไร และมีความเร็วเท่าไรตอนสิ้นสุด',
      problemEn: 'A car starts from rest and accelerates at 3 m/s² for 5 seconds. How far does it travel, and what is its final velocity?',
      given: [
        { label: 'ความเร็วต้น u', labelEn: 'Initial velocity u', value: '0 m/s' },
        { label: 'ความเร่ง a', labelEn: 'Acceleration a', value: '3 m/s²' },
        { label: 'เวลา t', labelEn: 'Time t', value: '5 s' },
      ],
      solution: [
        'หาระยะทาง: s = ut + ½at² = (0)(5) + ½(3)(5²) = 37.5 m',
        'หาความเร็วสุดท้าย: v = u + at = 0 + (3)(5) = 15 m/s',
      ],
      solutionEn: [
        'Find distance: s = ut + ½at² = (0)(5) + ½(3)(5²) = 37.5 m',
        'Find final velocity: v = u + at = 0 + (3)(5) = 15 m/s',
      ],
      answer: 'ระยะทาง = 37.5 m, ความเร็วสุดท้าย = 15 m/s',
      answerEn: 'Distance = 37.5 m, Final velocity = 15 m/s',
    },
    mascotLines: [
      'สวัสดี! ฉันชื่อนูโตะ วันนี้เราจะเรียนเรื่องการเคลื่อนที่แนวราบกันนะ!',
      'จำไว้ว่า v = u + at นี่คือสูตรหลักเลย!',
      'ลองทำตัวอย่างด้วยกันดูนะ เดี๋ยวจะเข้าใจเอง!',
    ],
    mascotLinesEn: [
      'Hello! I\'m Nuto. Today we\'ll learn about horizontal motion!',
      'Remember v = u + at — this is the key formula!',
      'Let\'s try an example together, you\'ll understand!',
    ],
  },
  {
    islandId: 'vertical-motion',
    title: 'การเคลื่อนที่แนวดิ่ง',
    titleEn: 'Vertical Motion',
    concept: [
      'การเคลื่อนที่แนวดิ่ง คือการเคลื่อนที่ภายใต้แรงโน้มถ่วงของโลก โดยความเร่งเนื่องจากแรงโน้มถ่วง g = 9.8 m/s² ลงด้านล่างเสมอ',
      'เมื่อโยนวัตถุขึ้น ความเร็วจะลดลงจนเป็นศูนย์ที่จุดสูงสุด แล้วตกลงมา',
      'เมื่อปล่อยให้วัตถุตกอย่างเสรี ความเร็วจะเพิ่มขึ้นด้วยความเร่ง g',
    ],
    conceptEn: [
      'Vertical motion is motion under Earth\'s gravity, with gravitational acceleration g = 9.8 m/s² always pointing downward.',
      'When an object is thrown upward, velocity decreases until it becomes zero at the maximum height, then falls back down.',
      'When an object is in free fall, velocity increases with acceleration g.',
    ],
    formulas: [
      {
        expression: 'v = u - gt',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)', meaningEn: 'final velocity (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s, ขึ้น = บวก)', meaningEn: 'initial velocity (m/s, up = positive)' },
          { symbol: 'g', meaning: 'ความเร่งโน้มถ่วง = 9.8 m/s²', meaningEn: 'gravitational acceleration = 9.8 m/s²' },
          { symbol: 't', meaning: 'เวลา (s)', meaningEn: 'time (s)' },
        ],
      },
      {
        expression: 'h = ut - ½gt²',
        variables: [
          { symbol: 'h', meaning: 'ความสูง (m)', meaningEn: 'height (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'g', meaning: '9.8 m/s²', meaningEn: '9.8 m/s²' },
          { symbol: 't', meaning: 'เวลา (s)', meaningEn: 'time (s)' },
        ],
      },
      {
        expression: 'h_max = u²/(2g)',
        variables: [
          { symbol: 'h_max', meaning: 'ความสูงสูงสุด (m)', meaningEn: 'maximum height (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'g', meaning: '9.8 m/s²', meaningEn: '9.8 m/s²' },
        ],
      },
    ],
    example: {
      problem: 'โยนลูกบอลขึ้นด้วยความเร็ว 19.6 m/s ลูกบอลจะขึ้นไปสูงสุดเท่าไร และใช้เวลากี่วินาทีถึงจุดสูงสุด',
      problemEn: 'A ball is thrown upward with velocity 19.6 m/s. What is its maximum height, and how long does it take to reach it?',
      given: [
        { label: 'ความเร็วต้น u', labelEn: 'Initial velocity u', value: '19.6 m/s (ขึ้น)' },
        { label: 'g', labelEn: 'g', value: '9.8 m/s²' },
        { label: 'v ที่จุดสูงสุด', labelEn: 'v at max height', value: '0 m/s' },
      ],
      solution: [
        'หาเวลา: v = u - gt → 0 = 19.6 - 9.8t → t = 2 s',
        'หาความสูงสูงสุด: h_max = u²/(2g) = (19.6²)/(2×9.8) = 19.6 m',
      ],
      solutionEn: [
        'Find time: v = u - gt → 0 = 19.6 - 9.8t → t = 2 s',
        'Find maximum height: h_max = u²/(2g) = (19.6²)/(2×9.8) = 19.6 m',
      ],
      answer: 'ความสูงสูงสุด = 19.6 m, เวลา = 2 วินาที',
      answerEn: 'Maximum height = 19.6 m, Time = 2 seconds',
    },
    mascotLines: [
      'การตกอย่างเสรีนั้นน่าตื่นเต้นมาก! แรงโน้มถ่วงโลกดึงทุกอย่างลง',
      'g = 9.8 m/s² — จำตัวเลขนี้ไว้ให้ขึ้นใจเลย!',
      'ที่จุดสูงสุด ความเร็วเป็นศูนย์เสมอนะ!',
    ],
    mascotLinesEn: [
      'Free fall is so exciting! Earth\'s gravity pulls everything down.',
      'g = 9.8 m/s² — memorize this number!',
      'At the maximum height, velocity is always zero!',
    ],
  },
  {
    islandId: 'projectile-motion',
    title: 'การเคลื่อนที่แบบโปรเจคไทล์',
    titleEn: 'Projectile Motion',
    concept: [
      'โปรเจคไทล์คือการเคลื่อนที่ในสองมิติพร้อมกัน — แนวราบ (ไม่มีความเร่ง) และแนวดิ่ง (ความเร่ง g)',
      'แยกความเร็วต้นออกเป็นแนวราบ (v₀cosθ) และแนวดิ่ง (v₀sinθ)',
      'แนวราบ: ความเร็วคงที่ตลอด | แนวดิ่ง: ได้รับผลจากแรงโน้มถ่วง',
    ],
    conceptEn: [
      'Projectile motion is two-dimensional motion — horizontal (no acceleration) and vertical (acceleration g).',
      'Decompose initial velocity into horizontal (v₀cosθ) and vertical (v₀sinθ) components.',
      'Horizontal: constant velocity throughout | Vertical: affected by gravity',
    ],
    formulas: [
      {
        expression: 'x = v₀cosθ · t',
        variables: [
          { symbol: 'x', meaning: 'ระยะทางแนวราบ (m)', meaningEn: 'horizontal distance (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)', meaningEn: 'launch angle (degrees)' },
          { symbol: 't', meaning: 'เวลา (s)', meaningEn: 'time (s)' },
        ],
      },
      {
        expression: 'y = v₀sinθ·t - ½gt²',
        variables: [
          { symbol: 'y', meaning: 'ความสูง (m)', meaningEn: 'height (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)', meaningEn: 'launch angle (degrees)' },
          { symbol: 'g', meaning: '9.8 m/s²', meaningEn: '9.8 m/s²' },
        ],
      },
      {
        expression: 'R = v₀²sin(2θ)/g',
        variables: [
          { symbol: 'R', meaning: 'ระยะพิสัย (m)', meaningEn: 'range (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)', meaningEn: 'initial velocity (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)', meaningEn: 'launch angle (degrees)' },
          { symbol: 'g', meaning: '9.8 m/s²', meaningEn: '9.8 m/s²' },
        ],
      },
    ],
    example: {
      problem: 'ยิงลูกปืนด้วยความเร็ว 20 m/s ที่มุม 30° เหนือแนวราบ จะมีระยะพิสัยเท่าไร',
      problemEn: 'A projectile is launched at 20 m/s at an angle of 30° above the horizontal. What is its range?',
      given: [
        { label: 'ความเร็วต้น v₀', labelEn: 'Initial velocity v₀', value: '20 m/s' },
        { label: 'มุม θ', labelEn: 'Angle θ', value: '30°' },
        { label: 'g', labelEn: 'g', value: '9.8 m/s²' },
      ],
      solution: [
        'R = v₀²sin(2θ)/g = (20²)×sin(60°)/9.8',
        'R = 400 × 0.866 / 9.8 ≈ 35.35 m',
      ],
      solutionEn: [
        'R = v₀²sin(2θ)/g = (20²)×sin(60°)/9.8',
        'R = 400 × 0.866 / 9.8 ≈ 35.35 m',
      ],
      answer: 'ระยะพิสัย ≈ 35.35 m',
      answerEn: 'Range ≈ 35.35 m',
    },
    mascotLines: [
      'โปรเจคไทล์นี่เหมือนยิงปืนใหญ่บนเกาะเลย! สนุกมาก!',
      'แยกการเคลื่อนที่เป็นสองส่วน — แนวราบ และ แนวดิ่ง!',
      'มุม 45° ให้ระยะพิสัยไกลที่สุดเสมอนะ จำไว้!',
    ],
    mascotLinesEn: [
      'Projectile motion is like firing a cannon on the island! So fun!',
      'Separate the motion into two parts — horizontal and vertical!',
      'A 45° angle gives the maximum range — remember that!',
    ],
  },
  {
    islandId: 'newton-1',
    title: 'กฎนิวตันข้อ 1 — กฎแห่งความเฉื่อย',
    titleEn: 'Newton\'s First Law — Law of Inertia',
    concept: [
      '"วัตถุจะคงสภาพการเคลื่อนที่เดิมไว้ ถ้าแรงสุทธิที่กระทำต่อวัตถุเป็นศูนย์"',
      'หมายความว่า ถ้าวัตถุหยุดนิ่ง มันก็จะหยุดนิ่งต่อไป ถ้าเคลื่อนที่อยู่ มันก็จะเคลื่อนที่ต่อไปด้วยความเร็วคงที่',
      'ความเฉื่อย (Inertia) คือแนวโน้มของวัตถุที่ต่อต้านการเปลี่ยนแปลงสภาพการเคลื่อนที่ มวลมากยิ่งมีความเฉื่อยมาก',
    ],
    conceptEn: [
      '"An object will maintain its state of motion if the net force acting on it is zero."',
      'This means if an object is at rest, it stays at rest; if it\'s moving, it continues moving at constant velocity.',
      'Inertia is an object\'s tendency to resist changes in motion. Greater mass means greater inertia.',
    ],
    formulas: [
      {
        expression: 'ΣF = 0 → a = 0',
        variables: [
          { symbol: 'ΣF', meaning: 'แรงสุทธิ (N)', meaningEn: 'net force (N)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
        ],
      },
      {
        expression: 'v = constant (เมื่อ a = 0)',
        variables: [
          { symbol: 'v', meaning: 'ความเร็ว (m/s) — คงที่เมื่อไม่มีแรงสุทธิ', meaningEn: 'velocity (m/s) — constant when no net force' },
        ],
      },
    ],
    example: {
      problem: 'หนังสือวางบนโต๊ะ มีแรงกด (น้ำหนัก) 10 N ลง และโต๊ะออกแรงปฏิกิริยา 10 N ขึ้น หนังสือมีความเร่งเท่าไร',
      problemEn: 'A book sits on a table with a downward force (weight) of 10 N and the table exerts an upward reaction force of 10 N. What is the book\'s acceleration?',
      given: [
        { label: 'แรงโน้มถ่วง', labelEn: 'Gravitational force', value: '10 N (ลง)' },
        { label: 'แรงปฏิกิริยา', labelEn: 'Reaction force', value: '10 N (ขึ้น)' },
      ],
      solution: [
        'ΣF = 10 - 10 = 0 N',
        'เมื่อ ΣF = 0 จะได้ a = 0 m/s²',
        'หนังสือหยุดนิ่ง — ไม่มีความเร่ง',
      ],
      solutionEn: [
        'ΣF = 10 - 10 = 0 N',
        'When ΣF = 0, then a = 0 m/s²',
        'The book is at rest — no acceleration',
      ],
      answer: 'ความเร่ง = 0 m/s² หนังสือคงอยู่นิ่ง',
      answerEn: 'Acceleration = 0 m/s² — the book remains at rest',
    },
    mascotLines: [
      'วัตถุนิสัยดื้อรั้นมาก — ถ้าไม่มีแรงมันก็ไม่ยอมเปลี่ยน!',
      'นั่นแหละที่เราเรียกว่าความเฉื่อย!',
      'ลองนึกภาพนั่งรถแล้วเบรกกะทันหัน ร่างกายเราพุ่งไปข้างหน้า — นั่นคือความเฉื่อย!',
    ],
    mascotLinesEn: [
      'Objects are stubborn — if there\'s no force, they won\'t change!',
      'That\'s what we call inertia!',
      'Imagine sitting in a car that suddenly brakes — your body lurches forward. That\'s inertia!',
    ],
  },
  {
    islandId: 'newton-2',
    title: 'กฎนิวตันข้อ 2 — แรงและความเร่ง',
    titleEn: 'Newton\'s Second Law — Force and Acceleration',
    concept: [
      '"แรงสุทธิที่กระทำต่อวัตถุเท่ากับมวลของวัตถุคูณด้วยความเร่ง"',
      'ยิ่งออกแรงมาก ความเร่งยิ่งมาก | มวลยิ่งมาก ความเร่งยิ่งน้อย',
      'แรงและความเร่งมีทิศทางเดียวกัน',
    ],
    conceptEn: [
      '"The net force on an object equals the mass of the object multiplied by its acceleration."',
      'More force means more acceleration | More mass means less acceleration',
      'Force and acceleration have the same direction.',
    ],
    formulas: [
      {
        expression: 'F = ma',
        variables: [
          { symbol: 'F', meaning: 'แรงสุทธิ (N = kg·m/s²)', meaningEn: 'net force (N = kg·m/s²)' },
          { symbol: 'm', meaning: 'มวล (kg)', meaningEn: 'mass (kg)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
        ],
      },
      {
        expression: 'a = F/m',
        variables: [
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)', meaningEn: 'acceleration (m/s²)' },
          { symbol: 'F', meaning: 'แรงสุทธิ (N)', meaningEn: 'net force (N)' },
          { symbol: 'm', meaning: 'มวล (kg)', meaningEn: 'mass (kg)' },
        ],
      },
    ],
    example: {
      problem: 'ออกแรง 30 N กระทำต่อกล่องมวล 5 kg บนพื้นเรียบ (ไม่มีแรงเสียดทาน) กล่องจะมีความเร่งเท่าไร',
      problemEn: 'A 30 N force is applied to a 5 kg box on a frictionless surface. What is the box\'s acceleration?',
      given: [
        { label: 'แรง F', labelEn: 'Force F', value: '30 N' },
        { label: 'มวล m', labelEn: 'Mass m', value: '5 kg' },
      ],
      solution: [
        'จาก F = ma',
        'a = F/m = 30/5 = 6 m/s²',
      ],
      solutionEn: [
        'From F = ma',
        'a = F/m = 30/5 = 6 m/s²',
      ],
      answer: 'ความเร่ง = 6 m/s²',
      answerEn: 'Acceleration = 6 m/s²',
    },
    mascotLines: [
      'F = ma นี่คือสูตรสำคัญที่สุดในฟิสิกส์เลยนะ!',
      'แรงมาก + มวลน้อย = เร่งเร็วมาก! ลองคิดดูสิ',
      'เหมือนดันรถยนต์ vs ดันจักรยาน ต่างกันมากเลย!',
    ],
    mascotLinesEn: [
      'F = ma is the most important formula in physics!',
      'Large force + small mass = big acceleration! Think about it!',
      'Like pushing a car vs pushing a bicycle — huge difference!',
    ],
  },
  {
    islandId: 'newton-3',
    title: 'กฎนิวตันข้อ 3 — แรงกิริยาและแรงปฏิกิริยา',
    titleEn: 'Newton\'s Third Law — Action and Reaction',
    concept: [
      '"ทุกแรงกิริยามีแรงปฏิกิริยาที่มีขนาดเท่ากันแต่มีทิศทางตรงข้าม"',
      'แรงคู่กิริยา-ปฏิกิริยา กระทำบนวัตถุคนละชิ้น จึงไม่หักล้างกัน',
      'ตัวอย่าง: เท้าดันพื้น (กิริยา) → พื้นดันเท้าขึ้น (ปฏิกิริยา)',
    ],
    conceptEn: [
      '"Every action force has an equal and opposite reaction force."',
      'Action-reaction pairs act on different objects, so they don\'t cancel.',
      'Example: Foot pushes ground (action) → Ground pushes foot up (reaction)',
    ],
    formulas: [
      {
        expression: 'F₁₂ = -F₂₁',
        variables: [
          { symbol: 'F₁₂', meaning: 'แรงที่วัตถุ 1 กระทำต่อวัตถุ 2 (N)', meaningEn: 'force of object 1 on object 2 (N)' },
          { symbol: 'F₂₁', meaning: 'แรงที่วัตถุ 2 กระทำต่อวัตถุ 1 (N)', meaningEn: 'force of object 2 on object 1 (N)' },
        ],
      },
      {
        expression: '|F₁₂| = |F₂₁|',
        variables: [
          { symbol: '|F|', meaning: 'ขนาดของแรงเท่ากันเสมอ', meaningEn: 'magnitude of forces always equal' },
        ],
      },
    ],
    example: {
      problem: 'คนมวล 60 kg ยืนบนเรือมวล 40 kg และผลักฝั่ง ถ้าคนถูกดันออกไปด้วยความเร่ง 2 m/s² เรือจะมีความเร่งเท่าไร',
      problemEn: 'A 60 kg person stands on a 40 kg boat and pushes off the shore. If the person accelerates at 2 m/s², what is the boat\'s acceleration?',
      given: [
        { label: 'มวลคน', labelEn: 'Person mass', value: '60 kg' },
        { label: 'มวลเรือ', labelEn: 'Boat mass', value: '40 kg' },
        { label: 'ความเร่งคน', labelEn: 'Person acceleration', value: '2 m/s²' },
      ],
      solution: [
        'แรงที่กระทำต่อคน: F = ma = 60 × 2 = 120 N',
        'แรงปฏิกิริยาบนเรือ = 120 N (ทิศตรงข้าม)',
        'ความเร่งเรือ: a = F/m = 120/40 = 3 m/s²',
      ],
      solutionEn: [
        'Force on person: F = ma = 60 × 2 = 120 N',
        'Reaction force on boat = 120 N (opposite direction)',
        'Boat acceleration: a = F/m = 120/40 = 3 m/s²',
      ],
      answer: 'เรือมีความเร่ง 3 m/s² ในทิศตรงข้ามกับคน',
      answerEn: 'Boat has acceleration 3 m/s² in the opposite direction',
    },
    mascotLines: [
      'ทุกการกระทำมีผลตอบแทนเสมอ — ในฟิสิกส์ก็เช่นกัน!',
      'ดันผนัง แล้วผนังก็ดันเราคืน ด้วยแรงเท่ากัน!',
      'จรวดบินขึ้นได้เพราะหลักนี้แหละ ไอพ่นลง ยานขึ้น!',
    ],
    mascotLinesEn: [
      'Every action has a reaction — in physics too!',
      'Push a wall, and the wall pushes back with equal force!',
      'Rockets fly because of this principle — exhaust down, rocket up!',
    ],
  },
]

export function getLearnContent(islandId: string): LearnContent | undefined {
  return LEARN_CONTENT.find(c => c.islandId === islandId)
}
