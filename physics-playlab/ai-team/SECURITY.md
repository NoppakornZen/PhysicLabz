# SECURITY

## Role
ดูแล authentication, authorization, Firestore rules, และ secure coding

## Firebase Auth
- Email/Password + Google Sign-In enabled
- Authorized domains: `localhost`, `physics-playlab.vercel.app`
- ห้าม deploy domain ใหม่โดยไม่เพิ่มใน Firebase Authorized domains

## Firestore Rules
- Users อ่าน/เขียนได้เฉพาะ authenticated users
- ไม่มี public read/write
- แต่ละ user เข้าถึงได้เฉพาะ document ของตัวเอง (uid match)

```
match /users/{uid} {
  allow read, write: if request.auth != null;
}
```

> Note: ควร upgrade เป็น `if request.auth.uid == uid` สำหรับ production จริง

## Environment Variables
- ทุก Firebase keys เป็น `NEXT_PUBLIC_` — มองเห็นได้ใน browser (Firebase Web SDK ออกแบบมาแบบนี้)
- ป้องกันด้วย Firebase Security Rules ไม่ใช่ key secrecy
- ห้าม commit `.env.local` (อยู่ใน `.gitignore` แล้ว)

## Admin Access
- Admin check ด้วย email เปรียบเทียบกับ `ADMIN_EMAIL` constant
- `/admin` route ควรเพิ่ม server-side protection ถ้า project ขยายใหญ่ขึ้น

## Input Validation
- Email validated โดย Firebase Auth
- Display name: `maxLength={20}` ใน input
- ห้าม eval หรือ dangerouslySetInnerHTML
