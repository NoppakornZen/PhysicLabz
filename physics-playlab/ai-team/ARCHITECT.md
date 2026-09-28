# ARCHITECT

## Role
ออกแบบและตัดสินใจด้าน system architecture, data flow, และ infrastructure

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.9 (App Router) |
| Styling | CSS Modules |
| Language | TypeScript strict |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Vercel |

## Data Flow
```
User Login → Firebase Auth → loadProgress(uid) from Firestore
              → restore localStorage → redirect to /lobby

Quiz Complete → syncProgress(uid, progress) → Firestore
              → localStorage updated
```

## Firestore Schema
```
users/{uid}
  - email: string
  - name: string
  - progress: IslandProgress[]
  - updatedAt: Timestamp
```

## Routing
```
/           → Login
/lobby      → Island map
/learn/[id] → Learning content
/lab/[id]   → Physics simulation
/quiz/[id]  → 10-question quiz
/admin      → Admin dashboard (ADMIN_EMAIL only)
```

## Decisions
- ใช้ localStorage เป็น primary store, Firestore เป็น cloud backup
- Static generation สำหรับ /lobby, /admin — Dynamic สำหรับ routes ที่มี [islandId]
- ไม่ใช้ server actions — client-side Firebase SDK ทั้งหมด
