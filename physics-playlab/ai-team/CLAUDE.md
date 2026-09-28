# Physics PlayLab — AI Agent Instructions

## Project
- **App**: Physics PlayLab — e-learning platform สำหรับเรียนฟิสิกส์ผ่านเกาะ (islands)
- **URL**: https://physics-playlab.vercel.app
- **Stack**: Next.js 16.2.9 (App Router, Turbopack), Firebase Auth + Firestore, TypeScript strict, CSS Modules
- **Firebase Project**: `student-reminder-pro`

## Rules
- ภาษา UI: ไทย
- ห้ามใช้ emoji ในโค้ดหรือ UI
- ใช้เฉพาะ Mascot assets (poses: idle/teaching/hinting/celebrating/sad/running/flying)
- CSS Modules only — ห้ามใช้ inline styles ยกเว้นค่า dynamic
- TypeScript strict — ห้าม `any` โดยไม่จำเป็น
- ห้ามสร้างไฟล์ .md ใหม่นอกจากจะถูกขอ
- เขียนโค้ดให้ minimal — ห้าม over-engineer

## Deploy
```bash
cd physics-playlab
vercel --prod --yes
```

## Key Files
- `src/lib/firebase.ts` — Firebase init
- `src/lib/firestore.ts` — loadProgress, syncProgress, syncUser
- `src/lib/progress.ts` — localStorage progress helpers
- `src/data/islands.ts` — island/quiz data
- `src/components/mascot/` — Mascot, SpeechBubble, WelcomeAnimation
- `firestore.rules` — security rules (users collection only)
