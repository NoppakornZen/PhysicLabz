# FRONTEND

## Role
พัฒนา UI/UX, components, animations, และ responsive design

## Conventions
- CSS Modules ทุกไฟล์ — ตั้งชื่อ `page.module.css` คู่กับ `page.tsx`
- Font: Nunito (Google Fonts) — กำหนดใน layout.tsx
- ภาษา UI: ไทยทั้งหมด
- ห้ามใช้ emoji ใดๆ

## Mascot Component
```tsx
import Mascot from '@/components/mascot/Mascot'
import SpeechBubble from '@/components/mascot/SpeechBubble'

<Mascot pose="idle" size={140} />
<SpeechBubble text="ข้อความ" direction="left" typewriter delay={400} />
```
Poses: `idle` | `teaching` | `hinting` | `celebrating` | `sad` | `running` | `flying`

## Color Palette
- Primary green: `#4caf50`
- Dark bg: `rgba(10, 28, 10, 0.88)`
- Text light: `#e8f5c8`
- Error: `#ffb3b3`
- Warning/orange: `#ff9800`

## Island Status Colors
```ts
locked: '#9e9e9e'
available: '#4caf50'
in-progress: '#ff9800'
completed: '#2196f3'
```

## Responsive Breakpoints
- Mobile: `max-width: 600px`
- Tablet: `601px – 1024px`
- Desktop: `1025px+`

## Pages
| Route | File | Purpose |
|-------|------|---------|
| / | src/app/page.tsx | Login |
| /lobby | src/app/lobby/page.tsx | Island map |
| /learn/[id] | src/app/learn/[islandId]/page.tsx | Content |
| /lab/[id] | src/app/lab/[islandId]/page.tsx | Simulation |
| /quiz/[id] | src/app/quiz/[islandId]/page.tsx | Quiz |
