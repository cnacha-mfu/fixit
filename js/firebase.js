// ═══ จุดเชื่อมต่อ Firebase จุดเดียวของทั้งเว็บ ═══
// ทุกหน้า import { db, auth } จากไฟล์นี้ — ถ้ายังไม่มีไฟล์ js/firebase-config.js
// จะได้ db = null แล้วหน้านั้นแสดงข้อความแนะนำวิธีตั้งค่าแทน

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let app = null;
let db = null;
let auth = null;

try {
  // dynamic import: ไฟล์นี้ผู้สอนสร้างเองจาก firebase-config.example.js (ถูก .gitignore กันไว้)
  const { firebaseConfig } = await import("./firebase-config.js");
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("ยังไม่ได้ต่อ Firebase:", e.message);
}

export { app, db, auth };
