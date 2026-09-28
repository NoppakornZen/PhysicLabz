# Physics PlayLab — Project Context

## Overview
E-learning platform สำหรับเรียนฟิสิกส์ระดับมัธยมผ่านระบบเกาะ (island progression)
นักเรียนต้องปลดล็อคเกาะตามลำดับโดยผ่าน Quiz 8/10 ข้อ

**Live URL:** https://physics-playlab.vercel.app

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript strict |
| Styling | CSS Modules (ห้าม inline styles ยกเว้น dynamic values) |
| Auth | Firebase Authentication (Email + Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Vercel (deploy ด้วย `vercel --prod --yes`) |

---

## Firebase
- **Project ID:** `student-reminder-pro`
- **Auth domain:** `student-reminder-pro.firebaseapp.com`
- **Authorized domains:** `localhost`, `physics-playlab.vercel.app`

---

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Login (Email + Google)
│   ├── page.module.css
│   ├── layout.tsx            # Root layout, fonts
│   ├── globals.css
│   ├── lobby/                # Island map
│   ├── learn/[islandId]/     # Learning content
│   ├── lab/[islandId]/       # Physics simulation
│   ├── quiz/[islandId]/      # 10-question quiz + answers
│   └── admin/                # Admin dashboard
├── components/
│   ├── mascot/
│   │   ├── Mascot.tsx        # poses: idle/teaching/hinting/celebrating/sad/running/flying
│   │   ├── SpeechBubble.tsx  # typewriter animation support
│   │   └── WelcomeAnimation.tsx
│   ├── lab/
│   │   └── LabCanvas.tsx     # Canvas physics simulation
│   └── MusicToggle.tsx
├── lib/
│   ├── firebase.ts           # Firebase init (auth, db)
│   ├── firestore.ts          # loadProgress, syncProgress, syncUser, ADMIN_EMAIL
│   ├── progress.ts           # localStorage helpers
│   ├── physicsEngine.ts      # Physics simulation logic
│   ├── sounds.ts             # SFX helpers
│   └── bgMusic.ts            # Background music
└── data/
    ├── islands.ts            # MAIN_ISLANDS, SubIsland definitions
    ├── quizzes.ts            # Quiz questions (10 ข้อต่อเกาะ)
    └── learnContent.ts       # Learning content per island
```

---

## Islands
| ID | ชื่อ | Chapter |
|----|------|---------|
| `horizontal-motion` | การเคลื่อนที่แนวราบ | การเคลื่อนที่ |
| `vertical-motion` | การเคลื่อนที่แนวดิ่ง | การเคลื่อนที่ |
| `projectile-motion` | โพรเจกไทล์ | การเคลื่อนที่ |
| `newton-1` | กฎข้อที่ 1 | กฎของนิวตัน |
| `newton-2` | กฎข้อที่ 2 | กฎของนิวตัน |
| `newton-3` | กฎข้อที่ 3 | กฎของนิวตัน |

Island status: `locked` → `available` → `in-progress` → `completed`

---

## Progress System
- **localStorage** — primary store (เร็ว, ทำงาน offline)
- **Firestore** `/users/{uid}` — cloud backup
- Flow: signin → `loadProgress(uid)` from Firestore → restore localStorage
- Flow: quiz pass → `syncProgress(uid, progress)` → Firestore + localStorage

---

## Conventions
- UI ภาษาไทยทั้งหมด
- ห้ามใช้ emoji ใดๆ ใน UI หรือโค้ด
- ใช้ Mascot component สำหรับ visual feedback เท่านั้น
- Font: Nunito (Google Fonts) — กำหนดใน `layout.tsx`
- ห้าม commit `.env.local`

---

## Deployment
```bash
# Deploy เว็บ
cd physics-playlab
vercel --prod --yes

# Deploy Firestore rules
firebase deploy --only firestore:rules --project student-reminder-pro
```

---

## Environment Variables
ตั้งค่าใน `.env.local` (local) และ Vercel dashboard (production):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## AI Team Docs
`ai-team/` folder:
- `ARCHITECT.md` — system design decisions
- `FRONTEND.md` — UI/UX conventions
- `BACKEND.md` — Firebase data layer
- `QA.md` — pre-deploy checklist
- `SECURITY.md` — auth & rules
- `PRODUCT_MANAGER.md` — features & roadmap
- `SKILL.md` — team capabilities
- `CLAUDE.md` — AI agent instructions
