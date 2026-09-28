# QA

## Role
ตรวจสอบคุณภาพ, ค้นหา bug, และ validate feature ก่อน deploy

## Checklist ก่อน Deploy

### Auth Flow
- [ ] Login ด้วย email/password ทำงานถูกต้อง
- [ ] Login ด้วย Google ทำงานถูกต้อง
- [ ] Signup สร้าง account และ progress ใหม่
- [ ] Logout ล้าง localStorage
- [ ] Login ซ้ำ restore progress จาก Firestore

### Island Progress
- [ ] เกาะแรก (horizontal-motion) เริ่มเป็น available
- [ ] เกาะถัดไปล็อคจนกว่าจะผ่านก่อนหน้า
- [ ] Quiz ผ่าน 8/10 ปักธงเกาะ
- [ ] Progress อยู่ครบหลัง logout แล้ว login ใหม่

### Pages
- [ ] /learn — content โหลดถูก island
- [ ] /lab — simulation ทำงาน
- [ ] /quiz — 10 ข้อ, แสดงเฉลย, คำนวณคะแนนถูก
- [ ] /admin — เข้าได้เฉพาะ admin email

### Responsive
- [ ] Mobile (375px) ไม่มี layout break
- [ ] Tablet (768px) ทำงานถูกต้อง

## Known Issues ที่แก้แล้ว
- Firestore permissions error → deploy firestore.rules
- Progress หายหลัง logout → loadProgress ตอน signin
- Env vars มี newline → re-add ผ่าน file redirect
