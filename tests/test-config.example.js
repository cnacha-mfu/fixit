// ═══ ตัวอย่างไฟล์ตั้งค่าชุดทดสอบ ═══
//
// วิธีใช้:
//   1. คัดลอกไฟล์นี้เป็นชื่อใหม่:  tests/test-config.js
//   2. แก้ BASE_URL เป็น URL จริงของระบบที่ deploy แล้ว (หรือ http://localhost:3000)
//   3. สมัครบัญชีทดสอบ 3 บัญชีที่ login.html แล้วใส่รหัสผ่านจริงด้านล่าง
//      จากนั้นแก้ role ใน Firebase Console: somying.test → technician · somsri.test → admin
//
// ⚠️ tests/test-config.js ถูก .gitignore กันไว้ — ห้าม commit (มีรหัสผ่านบัญชีทดสอบ)
// ⚠️ ใช้บัญชีสมมติ @example.com เท่านั้น ห้ามใช้อีเมลจริงของใคร

export const BASE_URL = "https://your-project-id.web.app";

export const ACCOUNTS = {
  reporter: {
    email: "somchai.test@example.com",
    password: "ใส่รหัสผ่านบัญชีทดสอบ",
    name: "สมชาย ใจดี",
  },
  technician: {
    email: "somying.test@example.com",
    password: "ใส่รหัสผ่านบัญชีทดสอบ",
    name: "สมหญิง รักงาน",
  },
  admin: {
    email: "somsri.test@example.com",
    password: "ใส่รหัสผ่านบัญชีทดสอบ",
    name: "สมศรี ตั้งใจ",
  },
};
