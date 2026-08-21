// ═══ ยามหน้าประตูของทุกหน้า (ยกเว้น login.html) ═══
//
// ทำ 3 อย่าง:
//   1. "รอ" จนกว่า Firebase จะบอกแน่ ๆ ว่าล็อกอินอยู่หรือไม่ — แล้วค่อยให้หน้าอ่านข้อมูล
//      (ถ้าไม่รอ จะเจอ permission denied ทั้งที่ล็อกอินอยู่ เพราะหน้าเว็บใจร้อนอ่านก่อนยืนยันเสร็จ)
//   2. ยังไม่ล็อกอิน → พาไป login.html
//   3. แสดงชื่อคนที่ล็อกอิน + ปุ่มออกจากระบบ ที่มุมขวาของแถบเมนู

import { db, auth } from "./firebase.js";
import {
  onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// เรียกครั้งเดียวตอนหน้าเริ่มโหลด — คืน { user, profile }
//   user    = บัญชีจาก Firebase Authentication (มี uid, email)
//   profile = ไฟล์ users/{uid} จาก Firestore (มี name, role)
export function requireLogin() {
  return new Promise((resolve) => {
    if (!auth) {
      // ยังไม่ได้ต่อ Firebase — บอกวิธีตั้งค่าแล้วหยุดตรงนี้
      document.querySelector("main").innerHTML =
        `<div class="notice notice-warn">⚠️ ยังไม่ได้ต่อ Firebase —
         คัดลอก js/firebase-config.example.js เป็น js/firebase-config.js
         แล้ววางค่าจริงก่อน (ดู SETUP.md)</div>`;
      return; // ไม่ resolve — หน้าไม่ทำงานต่อ
    }

    // onAuthStateChanged คือจุดที่ "รอสถานะล็อกอินพร้อม"
    const stop = onAuthStateChanged(auth, async (user) => {
      stop();
      if (!user) {
        location.href = "login.html";
        return;
      }

      // อ่านไฟล์ประจำตัวจากโฟลเดอร์ users
      let profile = { name: user.email, role: "reporter" };
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) profile = snap.data();
      } catch (e) {
        console.warn("อ่านไฟล์ผู้ใช้ไม่ได้:", e.message);
      }

      renderUserBox(user, profile);
      resolve({ user, profile });
    });
  });
}

function renderUserBox(user, profile) {
  const box = document.getElementById("user-box");
  if (!box) return;
  box.innerHTML = `
    <span id="user-name">👤 ${escapeText(profile.name || user.email)}</span>
    <button id="logout-btn" class="btn btn-small">ออกจากระบบ</button>`;
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    location.href = "login.html";
  });
}

function escapeText(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}
