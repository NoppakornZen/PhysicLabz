# SKILL

## Role
ระบุ skills และ capabilities ที่ ai-team นี้มี

## Development Skills
- Next.js 16 App Router, TypeScript, CSS Modules
- Firebase Auth (Email, Google Sign-In), Firestore, Security Rules
- Vercel deployment, environment variables
- React hooks, state management (useState, useEffect, useRef)
- Canvas API (LabCanvas physics simulations)
- CSS animations, responsive design

## AI Team Roles
| Agent | Responsibility |
|-------|---------------|
| ARCHITECT | System design, data flow, infrastructure decisions |
| FRONTEND | UI components, styling, animations |
| BACKEND | Firebase, Firestore, data layer |
| QA | Testing, bug finding, pre-deploy checklist |
| SECURITY | Auth, rules, secure coding |
| PRODUCT_MANAGER | Features, roadmap, user stories |

## Deploy Workflow
```bash
# แก้ code → deploy
vercel --prod --yes

# แก้ Firestore rules → deploy rules
firebase deploy --only firestore:rules --project student-reminder-pro
```

## Constraints
- UI ภาษาไทยเท่านั้น
- ห้ามใช้ emoji
- ใช้ Mascot component สำหรับ visual feedback ทั้งหมด
- Minimal code — ห้าม over-engineer
- ห้าม commit .env.local
