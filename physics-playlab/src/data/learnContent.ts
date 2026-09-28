// ===== LEARN CONTENT DATA =====
export interface Formula {
  expression: string
  variables: { symbol: string; meaning: string }[]
  unit?: string
}

export interface Example {
  problem: string
  given: { label: string; value: string }[]
  solution: string[]
  answer: string
}

export interface LearnContent {
  islandId: string
  title: string
  concept: string[]
  formulas: Formula[]
  example: Example
  mascotLines: string[]
}

export const LEARN_CONTENT: LearnContent[] = [
  {
    islandId: 'horizontal-motion',
    title: 'การเคลื่อนที่แนวราบ',
    concept: [
      'การเคลื่อนที่แนวราบ คือการเคลื่อนที่ของวัตถุบนพื้นราบในแนวเส้นตรง โดยอาจมีหรือไม่มีความเร่งก็ได้',
      'ถ้าความเร่งเป็นศูนย์ วัตถุจะเคลื่อนที่ด้วยความเร็วคงที่ (Uniform Motion)',
      'ถ้ามีความเร่งคงที่ ความเร็วจะเปลี่ยนแปลงเป็นเส้นตรงตามเวลา (Uniformly Accelerated Motion)',
    ],
    formulas: [
      {
        expression: 'v = u + at',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
          { symbol: 't', meaning: 'เวลา (s)' },
        ],
      },
      {
        expression: 's = ut + ½at²',
        variables: [
          { symbol: 's', meaning: 'ระยะทาง (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
          { symbol: 't', meaning: 'เวลา (s)' },
        ],
      },
      {
        expression: 'v² = u² + 2as',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
          { symbol: 's', meaning: 'ระยะทาง (m)' },
        ],
      },
    ],
    example: {
      problem: 'รถยนต์เริ่มต้นจากหยุดนิ่ง เร่งความเร็วด้วยความเร่ง 3 m/s² เป็นเวลา 5 วินาที รถวิ่งได้ระยะทางเท่าไร และมีความเร็วเท่าไรตอนสิ้นสุด',
      given: [
        { label: 'ความเร็วต้น u', value: '0 m/s' },
        { label: 'ความเร่ง a', value: '3 m/s²' },
        { label: 'เวลา t', value: '5 s' },
      ],
      solution: [
        'หาระยะทาง: s = ut + ½at² = (0)(5) + ½(3)(5²) = 37.5 m',
        'หาความเร็วสุดท้าย: v = u + at = 0 + (3)(5) = 15 m/s',
      ],
      answer: 'ระยะทาง = 37.5 m, ความเร็วสุดท้าย = 15 m/s',
    },
    mascotLines: [
      'สวัสดี! ฉันชื่อนูโตะ วันนี้เราจะเรียนเรื่องการเคลื่อนที่แนวราบกันนะ!',
      'จำไว้ว่า v = u + at นี่คือสูตรหลักเลย!',
      'ลองทำตัวอย่างด้วยกันดูนะ เดี๋ยวจะเข้าใจเอง!',
    ],
  },
  {
    islandId: 'vertical-motion',
    title: 'การเคลื่อนที่แนวดิ่ง',
    concept: [
      'การเคลื่อนที่แนวดิ่ง คือการเคลื่อนที่ภายใต้แรงโน้มถ่วงของโลก โดยความเร่งเนื่องจากแรงโน้มถ่วง g = 9.8 m/s² ลงด้านล่างเสมอ',
      'เมื่อโยนวัตถุขึ้น ความเร็วจะลดลงจนเป็นศูนย์ที่จุดสูงสุด แล้วตกลงมา',
      'เมื่อปล่อยให้วัตถุตกอย่างเสรี ความเร็วจะเพิ่มขึ้นด้วยความเร่ง g',
    ],
    formulas: [
      {
        expression: 'v = u - gt',
        variables: [
          { symbol: 'v', meaning: 'ความเร็วสุดท้าย (m/s)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s, ขึ้น = บวก)' },
          { symbol: 'g', meaning: 'ความเร่งโน้มถ่วง = 9.8 m/s²' },
          { symbol: 't', meaning: 'เวลา (s)' },
        ],
      },
      {
        expression: 'h = ut - ½gt²',
        variables: [
          { symbol: 'h', meaning: 'ความสูง (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'g', meaning: '9.8 m/s²' },
          { symbol: 't', meaning: 'เวลา (s)' },
        ],
      },
      {
        expression: 'h_max = u²/(2g)',
        variables: [
          { symbol: 'h_max', meaning: 'ความสูงสูงสุด (m)' },
          { symbol: 'u', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'g', meaning: '9.8 m/s²' },
        ],
      },
    ],
    example: {
      problem: 'โยนลูกบอลขึ้นด้วยความเร็ว 19.6 m/s ลูกบอลจะขึ้นไปสูงสุดเท่าไร และใช้เวลากี่วินาทีถึงจุดสูงสุด',
      given: [
        { label: 'ความเร็วต้น u', value: '19.6 m/s (ขึ้น)' },
        { label: 'g', value: '9.8 m/s²' },
        { label: 'v ที่จุดสูงสุด', value: '0 m/s' },
      ],
      solution: [
        'หาเวลา: v = u - gt → 0 = 19.6 - 9.8t → t = 2 s',
        'หาความสูงสูงสุด: h_max = u²/(2g) = (19.6²)/(2×9.8) = 19.6 m',
      ],
      answer: 'ความสูงสูงสุด = 19.6 m, เวลา = 2 วินาที',
    },
    mascotLines: [
      'การตกอย่างเสรีนั้นน่าตื่นเต้นมาก! แรงโน้มถ่วงโลกดึงทุกอย่างลง',
      'g = 9.8 m/s² — จำตัวเลขนี้ไว้ให้ขึ้นใจเลย!',
      'ที่จุดสูงสุด ความเร็วเป็นศูนย์เสมอนะ!',
    ],
  },
  {
    islandId: 'projectile-motion',
    title: 'การเคลื่อนที่แบบโปรเจคไทล์',
    concept: [
      'โปรเจคไทล์คือการเคลื่อนที่ในสองมิติพร้อมกัน — แนวราบ (ไม่มีความเร่ง) และแนวดิ่ง (ความเร่ง g)',
      'แยกความเร็วต้นออกเป็นแนวราบ (v₀cosθ) และแนวดิ่ง (v₀sinθ)',
      'แนวราบ: ความเร็วคงที่ตลอด | แนวดิ่ง: ได้รับผลจากแรงโน้มถ่วง',
    ],
    formulas: [
      {
        expression: 'x = v₀cosθ · t',
        variables: [
          { symbol: 'x', meaning: 'ระยะทางแนวราบ (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)' },
          { symbol: 't', meaning: 'เวลา (s)' },
        ],
      },
      {
        expression: 'y = v₀sinθ·t - ½gt²',
        variables: [
          { symbol: 'y', meaning: 'ความสูง (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)' },
          { symbol: 'g', meaning: '9.8 m/s²' },
        ],
      },
      {
        expression: 'R = v₀²sin(2θ)/g',
        variables: [
          { symbol: 'R', meaning: 'ระยะพิสัย (m)' },
          { symbol: 'v₀', meaning: 'ความเร็วต้น (m/s)' },
          { symbol: 'θ', meaning: 'มุมยิง (องศา)' },
          { symbol: 'g', meaning: '9.8 m/s²' },
        ],
      },
    ],
    example: {
      problem: 'ยิงลูกปืนด้วยความเร็ว 20 m/s ที่มุม 30° เหนือแนวราบ จะมีระยะพิสัยเท่าไร',
      given: [
        { label: 'ความเร็วต้น v₀', value: '20 m/s' },
        { label: 'มุม θ', value: '30°' },
        { label: 'g', value: '9.8 m/s²' },
      ],
      solution: [
        'R = v₀²sin(2θ)/g = (20²)×sin(60°)/9.8',
        'R = 400 × 0.866 / 9.8 ≈ 35.35 m',
      ],
      answer: 'ระยะพิสัย ≈ 35.35 m',
    },
    mascotLines: [
      'โปรเจคไทล์นี่เหมือนยิงปืนใหญ่บนเกาะเลย! สนุกมาก!',
      'แยกการเคลื่อนที่เป็นสองส่วน — แนวราบ และ แนวดิ่ง!',
      'มุม 45° ให้ระยะพิสัยไกลที่สุดเสมอนะ จำไว้!',
    ],
  },
  {
    islandId: 'newton-1',
    title: 'กฎนิวตันข้อ 1 — กฎแห่งความเฉื่อย',
    concept: [
      '"วัตถุจะคงสภาพการเคลื่อนที่เดิมไว้ ถ้าแรงสุทธิที่กระทำต่อวัตถุเป็นศูนย์"',
      'หมายความว่า ถ้าวัตถุหยุดนิ่ง มันก็จะหยุดนิ่งต่อไป ถ้าเคลื่อนที่อยู่ มันก็จะเคลื่อนที่ต่อไปด้วยความเร็วคงที่',
      'ความเฉื่อย (Inertia) คือแนวโน้มของวัตถุที่ต่อต้านการเปลี่ยนแปลงสภาพการเคลื่อนที่ มวลมากยิ่งมีความเฉื่อยมาก',
    ],
    formulas: [
      {
        expression: 'ΣF = 0 → a = 0',
        variables: [
          { symbol: 'ΣF', meaning: 'แรงสุทธิ (N)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
        ],
      },
      {
        expression: 'v = constant (เมื่อ a = 0)',
        variables: [
          { symbol: 'v', meaning: 'ความเร็ว (m/s) — คงที่เมื่อไม่มีแรงสุทธิ' },
        ],
      },
    ],
    example: {
      problem: 'หนังสือวางบนโต๊ะ มีแรงกด (น้ำหนัก) 10 N ลง และโต๊ะออกแรงปฏิกิริยา 10 N ขึ้น หนังสือมีความเร่งเท่าไร',
      given: [
        { label: 'แรงโน้มถ่วง', value: '10 N (ลง)' },
        { label: 'แรงปฏิกิริยา', value: '10 N (ขึ้น)' },
      ],
      solution: [
        'ΣF = 10 - 10 = 0 N',
        'เมื่อ ΣF = 0 จะได้ a = 0 m/s²',
        'หนังสือหยุดนิ่ง — ไม่มีความเร่ง',
      ],
      answer: 'ความเร่ง = 0 m/s² หนังสือคงอยู่นิ่ง',
    },
    mascotLines: [
      'วัตถุนิสัยดื้อรั้นมาก — ถ้าไม่มีแรงมันก็ไม่ยอมเปลี่ยน!',
      'นั่นแหละที่เราเรียกว่าความเฉื่อย!',
      'ลองนึกภาพนั่งรถแล้วเบรกกะทันหัน ร่างกายเราพุ่งไปข้างหน้า — นั่นคือความเฉื่อย!',
    ],
  },
  {
    islandId: 'newton-2',
    title: 'กฎนิวตันข้อ 2 — แรงและความเร่ง',
    concept: [
      '"แรงสุทธิที่กระทำต่อวัตถุเท่ากับมวลของวัตถุคูณด้วยความเร่ง"',
      'ยิ่งออกแรงมาก ความเร่งยิ่งมาก | มวลยิ่งมาก ความเร่งยิ่งน้อย',
      'แรงและความเร่งมีทิศทางเดียวกัน',
    ],
    formulas: [
      {
        expression: 'F = ma',
        variables: [
          { symbol: 'F', meaning: 'แรงสุทธิ (N = kg·m/s²)' },
          { symbol: 'm', meaning: 'มวล (kg)' },
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
        ],
      },
      {
        expression: 'a = F/m',
        variables: [
          { symbol: 'a', meaning: 'ความเร่ง (m/s²)' },
          { symbol: 'F', meaning: 'แรงสุทธิ (N)' },
          { symbol: 'm', meaning: 'มวล (kg)' },
        ],
      },
    ],
    example: {
      problem: 'ออกแรง 30 N กระทำต่อกล่องมวล 5 kg บนพื้นเรียบ (ไม่มีแรงเสียดทาน) กล่องจะมีความเร่งเท่าไร',
      given: [
        { label: 'แรง F', value: '30 N' },
        { label: 'มวล m', value: '5 kg' },
      ],
      solution: [
        'จาก F = ma',
        'a = F/m = 30/5 = 6 m/s²',
      ],
      answer: 'ความเร่ง = 6 m/s²',
    },
    mascotLines: [
      'F = ma นี่คือสูตรสำคัญที่สุดในฟิสิกส์เลยนะ!',
      'แรงมาก + มวลน้อย = เร่งเร็วมาก! ลองคิดดูสิ',
      'เหมือนดันรถยนต์ vs ดันจักรยาน ต่างกันมากเลย!',
    ],
  },
  {
    islandId: 'newton-3',
    title: 'กฎนิวตันข้อ 3 — แรงกิริยาและแรงปฏิกิริยา',
    concept: [
      '"ทุกแรงกิริยามีแรงปฏิกิริยาที่มีขนาดเท่ากันแต่มีทิศทางตรงข้าม"',
      'แรงคู่กิริยา-ปฏิกิริยา กระทำบนวัตถุคนละชิ้น จึงไม่หักล้างกัน',
      'ตัวอย่าง: เท้าดันพื้น (กิริยา) → พื้นดันเท้าขึ้น (ปฏิกิริยา)',
    ],
    formulas: [
      {
        expression: 'F₁₂ = -F₂₁',
        variables: [
          { symbol: 'F₁₂', meaning: 'แรงที่วัตถุ 1 กระทำต่อวัตถุ 2 (N)' },
          { symbol: 'F₂₁', meaning: 'แรงที่วัตถุ 2 กระทำต่อวัตถุ 1 (N)' },
        ],
      },
      {
        expression: '|F₁₂| = |F₂₁|',
        variables: [
          { symbol: '|F|', meaning: 'ขนาดของแรงเท่ากันเสมอ' },
        ],
      },
    ],
    example: {
      problem: 'คนมวล 60 kg ยืนบนเรือมวล 40 kg และผลักฝั่ง ถ้าคนถูกดันออกไปด้วยความเร่ง 2 m/s² เรือจะมีความเร่งเท่าไร',
      given: [
        { label: 'มวลคน', value: '60 kg' },
        { label: 'มวลเรือ', value: '40 kg' },
        { label: 'ความเร่งคน', value: '2 m/s²' },
      ],
      solution: [
        'แรงที่กระทำต่อคน: F = ma = 60 × 2 = 120 N',
        'แรงปฏิกิริยาบนเรือ = 120 N (ทิศตรงข้าม)',
        'ความเร่งเรือ: a = F/m = 120/40 = 3 m/s²',
      ],
      answer: 'เรือมีความเร่ง 3 m/s² ในทิศตรงข้ามกับคน',
    },
    mascotLines: [
      'ทุกการกระทำมีผลตอบแทนเสมอ — ในฟิสิกส์ก็เช่นกัน!',
      'ดันผนัง แล้วผนังก็ดันเราคืน ด้วยแรงเท่ากัน!',
      'จรวดบินขึ้นได้เพราะหลักนี้แหละ ไอพ่นลง ยานขึ้น!',
    ],
  },
]

export function getLearnContent(islandId: string): LearnContent | undefined {
  return LEARN_CONTENT.find(c => c.islandId === islandId)
}
