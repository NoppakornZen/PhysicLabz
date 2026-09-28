# PRODUCT MANAGER

## Role
กำหนด feature, priority, user stories, และ roadmap ของ Physics PlayLab

## Product Overview
Physics PlayLab คือ e-learning platform สำหรับเรียนฟิสิกส์ระดับมัธยม ผ่านรูปแบบเกาะที่ต้องปลดล็อคตามลำดับ

## Current Features (v1)
- [x] Login / Signup ด้วย Email
- [x] Login ด้วย Google
- [x] 6 เกาะ (2 chapters: การเคลื่อนที่, กฎของนิวตัน)
- [x] 3 modes: Learn, Lab, Quiz
- [x] Island progression system (ล็อค/ปลดล็อค)
- [x] Progress sync กับ Firestore (ไม่หายหลัง logout)
- [x] Admin dashboard
- [x] Mascot + Speech bubble animations
- [x] Scroll-driven background (20 frames)
- [x] Deployed: https://physics-playlab.vercel.app

## Islands
| ID | ชื่อ | Chapter |
|----|------|---------|
| horizontal-motion | การเคลื่อนที่แนวราบ | การเคลื่อนที่ |
| vertical-motion | การเคลื่อนที่แนวดิ่ง | การเคลื่อนที่ |
| projectile-motion | โพรเจกไทล์ | การเคลื่อนที่ |
| newton-1 | กฎข้อที่ 1 | กฎของนิวตัน |
| newton-2 | กฎข้อที่ 2 | กฎของนิวตัน |
| newton-3 | กฎข้อที่ 3 | กฎของนิวตัน |

## Potential Features (Backlog)
- Discord webhook notifications (new signup, island completion)
- Leaderboard สำหรับนักเรียนในห้อง
- Teacher dashboard (ดู progress นักเรียนรายคน)
- เพิ่ม chapter ใหม่ (พลังงาน, คลื่น)
- Badge / Achievement system
