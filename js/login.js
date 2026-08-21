// ═══ หน้าเข้าสู่ระบบ / สมัครสมาชิก ═══
// สมัครสำเร็จ → สร้างไฟล์ users/{uid} พร้อม role ค่าเริ่มต้น "reporter"
// (เปลี่ยน role เป็น technician / admin ทำโดยผู้ดูแลใน Firebase Console)

import { db, auth } from "./firebase.js";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const noticeArea = document.getElementById("notice-area");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const nameField = document.getElementById("name-field");
const nameEl = document.getElementById("display-name");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

function show(kind, message) {
  const div = document.createElement("div");
  div.className = `notice notice-${kind}`;
  div.textContent = message;
  noticeArea.replaceChildren(div);
}

// แปลรหัส error ของ Firebase เป็นภาษาไทยที่บอกทางออก
function thaiError(e) {
  const code = e.code || "";
  if (code.includes("invalid-email")) return "รูปแบบอีเมลไม่ถูกต้อง — ตรวจการสะกดอีกครั้ง";
  if (code.includes("weak-password")) return "รหัสผ่านสั้นเกินไป — ใช้อย่างน้อย 6 ตัวอักษร";
  if (code.includes("email-already-in-use")) return "อีเมลนี้สมัครไว้แล้ว — กดเข้าสู่ระบบแทน";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง — ลองใหม่ หรือสมัครสมาชิกถ้ายังไม่มีบัญชี";
  if (code.includes("too-many-requests")) return "ลองผิดหลายครั้งเกินไป — พักสักครู่แล้วลองใหม่";
  return `เข้าสู่ระบบไม่สำเร็จ: ${e.message}`;
}

if (!auth) {
  show("warn", "ยังไม่ได้ต่อ Firebase — คัดลอก js/firebase-config.example.js เป็น js/firebase-config.js แล้ววางค่าจริงก่อน (ดู SETUP.md)");
  loginBtn.disabled = true;
  signupBtn.disabled = true;
}

loginBtn?.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  if (!email || !password) return show("error", "กรุณากรอกอีเมลและรหัสผ่านให้ครบ");

  loginBtn.disabled = true;
  loginBtn.textContent = "กำลังเข้าสู่ระบบ...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "index.html";
  } catch (e) {
    show("error", thaiError(e));
    loginBtn.disabled = false;
    loginBtn.textContent = "เข้าสู่ระบบ";
  }
});

signupBtn?.addEventListener("click", async () => {
  // กดครั้งแรก: เปิดช่องกรอกชื่อก่อน
  if (nameField.style.display === "none") {
    nameField.style.display = "";
    show("ok", "กรอกชื่อ-นามสกุลเพิ่มหนึ่งช่อง แล้วกดสมัครสมาชิกอีกครั้ง");
    nameEl.focus();
    return;
  }

  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const name = nameEl.value.trim();
  if (!email || !password) return show("error", "กรุณากรอกอีเมลและรหัสผ่านให้ครบ");
  if (!name) return show("error", "กรุณากรอกชื่อ-นามสกุล");

  signupBtn.disabled = true;
  signupBtn.textContent = "กำลังสมัคร...";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // สร้างไฟล์ประจำตัวใน users — ชื่อไฟล์ = uid · role เริ่มต้นเป็น reporter
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "reporter",
    });
    location.href = "index.html";
  } catch (e) {
    show("error", thaiError(e));
    signupBtn.disabled = false;
    signupBtn.textContent = "สมัครสมาชิกใหม่";
  }
});
