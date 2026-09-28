# BACKEND

## Role
จัดการ Firebase, Firestore schema, security rules, และ data layer

## Firebase Project
- Project ID: `student-reminder-pro`
- Auth: Email/Password + Google Sign-In
- Database: Cloud Firestore (production mode)

## Key Libraries
```ts
// src/lib/firebase.ts — init
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// src/lib/firestore.ts — helpers
loadProgress(uid)     // อ่าน progress จาก Firestore
syncProgress(uid, p)  // เขียน progress ลง Firestore
syncUser(uid, email, name) // upsert user document

// src/lib/progress.ts — localStorage helpers
getProgress()
initProgress(name)
saveProgress(p)
clearProgress()
getIslandStatus(id)
```

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

## Deploy Rules
```bash
firebase deploy --only firestore:rules --project student-reminder-pro
```

## Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```
ตั้งค่าใน `.env.local` (local) และ Vercel dashboard (production)

## Admin
- `ADMIN_EMAIL` กำหนดใน `src/lib/firestore.ts`
- Admin redirect ไป `/admin` อัตโนมัติหลัง login
