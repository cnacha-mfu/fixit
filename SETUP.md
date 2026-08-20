# ⚙️ SETUP — ขั้นตอนที่ผู้สอนต้องทำเอง (~10 นาที)

> ทำครั้งเดียวต่อเครื่อง แล้วสลับแท็กไปมาได้เลย เพราะไฟล์ตั้งค่าทุกไฟล์ถูก `.gitignore` กันไว้
>
> ⚠️ **ไฟล์ config ทุกไฟล์ (js/firebase-config.js · js/config.js · .firebaserc · tests/test-config.js)
> ถูก `.gitignore` กันไว้แล้ว — ห้าม commit เด็ดขาด** ตรวจด้วย `git status` ก่อน push ทุกครั้ง

## 1. สร้างโปรเจกต์ Firebase (~3 นาที)

1. เข้า [Firebase Console](https://console.firebase.google.com) → **Add project** → ตั้งชื่อ เช่น `fixit-demo`
2. เมนู **Firestore Database** → **Create database** → เลือก **โหมดทดสอบ (test mode)**
   → เลือกตำแหน่งเซิร์ฟเวอร์ใกล้เอเชีย
   - 📝 จดวันหมดอายุโหมดทดสอบไว้ — ถึงวันนั้นระบบจะเงียบใส่โดยไม่บอกอะไร
   - สาธิตตามสคริปต์สัปดาห์ที่ 6 จะสร้าง Firestore **สดในคาบ** — ข้อนี้ทำล่วงหน้าเฉพาะตอนซ้อม
3. เมนู **Authentication** → **Get started** → เปิดวิธี **Email/Password** (ใช้ตั้งแต่สัปดาห์ที่ 7)

## 2. วาง config ของเว็บ (~2 นาที)

1. ⚙️ **Project settings → Your apps** → เพิ่ม Web app (ไอคอน `</>`) → คัดลอกก้อน `firebaseConfig`
2. คัดลอกไฟล์ `js/firebase-config.example.js` เป็น **`js/firebase-config.js`** แล้ววางค่าจริงแทนที่
3. ตรวจว่า `git status` **ไม่แสดง** `js/firebase-config.js` — ถ้าแสดง แปลว่า .gitignore พัง อย่าเพิ่ง commit

## 3. ใส่ข้อมูลตัวอย่าง (seed) (~1 นาที)

1. `npm run dev` → เปิด `http://localhost:3000/seed.html`
2. กดปุ่ม **ใส่ข้อมูลตัวอย่าง** → รอจนขึ้น "เพิ่มข้อมูลครบแล้ว"
3. เปิด Firebase Console หน้า Data ตรวจด้วยตาว่ามี `users` `categories` `tickets` ครบ
   และในไฟล์ `t001` มีโฟลเดอร์ย่อย `comments`

> หมายเหตุ: ตั้งแต่แท็ก `week7-end` เป็นต้นไป กฎกำหนดว่าต้องล็อกอินก่อนเขียนข้อมูล —
> ถ้า seed ไม่ผ่าน ให้ล็อกอินที่ `login.html` ก่อน แล้วค่อยเปิด `seed.html`

## 4. บัญชีทดสอบ (สัปดาห์ที่ 7 ขึ้นไป)

1. เปิด `login.html` สมัคร 3 บัญชี (รหัสผ่านอะไรก็ได้ ≥ 6 ตัว จดไว้):
   - `somchai@example.com` (สมชาย ใจดี) · `somying@example.com` (สมหญิง รักงาน) · `somsri@example.com` (สมศรี ตั้งใจ)
2. สมัครแล้วทุกบัญชีได้ `role: "reporter"` อัตโนมัติ — เข้า Firebase Console → `users` →
   แก้ role ของสมหญิงเป็น `technician` และสมศรีเป็น `admin` **ด้วยมือ** (สะกดตรงตัวพิมพ์เล็กทั้งหมด)

## 5. Deploy ขึ้น Firebase Hosting (สัปดาห์ที่ 7 ขึ้นไป · ~2 นาที)

1. ติดตั้ง CLI ครั้งเดียว: `npm install -g firebase-tools` แล้ว `firebase login`
2. คัดลอก `.firebaserc.example` เป็น **`.firebaserc`** แล้วแก้ `your-project-id` เป็น id โปรเจกต์จริง
3. `firebase deploy` → รอจนขึ้น **Deploy complete!** → ได้ URL ลงท้าย `.web.app`
   - deploy เฉพาะกฎ: `firebase deploy --only firestore:rules`

## 6. คีย์ OpenRouter (สัปดาห์ที่ 8 ขึ้นไป · ~2 นาที)

1. สร้างคีย์ที่ [openrouter.ai](https://openrouter.ai) → **ตั้งวงเงิน (limit) ทุกใบเสมอ**
2. คัดลอก `js/config.example.js` เป็น **`js/config.js`** → วางคีย์ · ใส่ชื่อโมเดลหลักและโมเดลสำรอง
   ที่**ทดสอบแล้วเช้าวันสอน** (ชื่อรุ่นเปลี่ยนบ่อย — ตรวจสอบล่าสุดก่อนสอน)
3. ทดสอบที่ `ai-test.html` ให้เรียกสำเร็จ 1 ครั้งก่อนคาบเสมอ
4. ⚠️ คีย์ที่วางในเว็บ ผู้ใช้เปิดดูได้ — ยอมรับได้เฉพาะในคาบเรียนเพราะมีวงเงิน
   **หลังคาบสาธิตให้เพิกถอนคีย์ทันที** · ระบบจริงต้องมีตัวกลางเก็บคีย์ (Backlog Sprint 2)

## 7. ชุดทดสอบ Playwright (สัปดาห์ที่ 9)

ดูวิธีติดตั้งและรันใน [`tests/README.md`](tests/README.md)
