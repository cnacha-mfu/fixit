// ═══ ตัวอย่างไฟล์ตั้งค่า Firebase ═══
//
// วิธีใช้ (ดูขั้นตอนเต็มใน SETUP.md):
//   1. คัดลอกไฟล์นี้เป็นชื่อใหม่:  js/firebase-config.js
//   2. เข้า Firebase Console → ⚙️ Project settings → Your apps → คัดลอกก้อน firebaseConfig
//   3. วางค่าจริงแทนที่ค่าตัวอย่างด้านล่างทั้งหมด
//
// ⚠️ ไฟล์ js/firebase-config.js ถูก .gitignore กันไว้ — ห้าม commit
//    (ค่า firebaseConfig ไม่ใช่ความลับก็จริง แต่แยกไฟล์ไว้เพื่อให้
//     repo นี้ใช้กับโปรเจกต์ Firebase ของใครก็ได้)

export const firebaseConfig = {
  apiKey: "วางค่าจริงจาก-Firebase-Console",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxx",
};
