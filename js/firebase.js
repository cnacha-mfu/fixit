// ═══ จุดเชื่อมต่อ Firebase จุดเดียวของทั้งเว็บ ═══
// ทุกหน้า import { db } จากไฟล์นี้ — ถ้ายังไม่มีไฟล์ js/firebase-config.js
// จะได้ db = null แล้วแต่ละหน้าตัดสินใจเองว่าจะ fallback อย่างไร

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let app = null;
let db = null;

try {
  // dynamic import: ไฟล์นี้ผู้สอนสร้างเองจาก firebase-config.example.js (ถูก .gitignore กันไว้)
  const { firebaseConfig } = await import("./firebase-config.js");
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("ยังไม่ได้ต่อ Firebase — จะใช้ข้อมูลปลอมแทน:", e.message);
}

export { app, db };
