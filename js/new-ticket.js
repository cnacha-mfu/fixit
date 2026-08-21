// ═══ หน้าแจ้งซ่อมใหม่ — บันทึกลง Firestore จริง ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, markActiveNav } from "./ui.js";
import {
  collection, getDocs, addDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

markActiveNav();

const form = document.getElementById("ticket-form");
const noticeArea = document.getElementById("notice-area");
const categorySelect = document.getElementById("category");
const saveBtn = document.getElementById("save-btn");

let me = null; // { user, profile } ของคนที่ล็อกอินอยู่

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

async function loadCategories() {
  // หมวดหมู่ในรายการเลื่อนลง อ่านจากโฟลเดอร์ categories จริง
  const snap = await getDocs(collection(db, "categories"));
  for (const d of snap.docs) {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.data().name;
    categorySelect.appendChild(opt);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!me) return;

  const title = document.getElementById("title").value.trim();
  const detail = document.getElementById("detail").value.trim();
  const categoryId = categorySelect.value;
  const location_ = document.getElementById("location").value.trim();

  // ตรวจข้อมูลก่อนบันทึก — กรอกไม่ครบต้องเตือนเป็นภาษาไทยและไม่บันทึก
  if (!title) return showError("กรุณากรอกหัวข้อ");
  if (!detail) return showError("กรุณากรอกรายละเอียดอาการ");
  if (!categoryId) return showError("กรุณาเลือกหมวดหมู่");
  if (!location_) return showError("กรุณากรอกสถานที่");

  const categoryName = categorySelect.options[categorySelect.selectedIndex].textContent;

  saveBtn.disabled = true;
  saveBtn.textContent = "กำลังบันทึก...";
  try {
    await addDoc(collection(db, "tickets"), {
      title,
      detail,
      location: location_,
      status: "แจ้งใหม่",              // ระบบตั้งให้อัตโนมัติ ผู้ใช้เลือกเองไม่ได้
      reporterId: me.user.uid,          // uid ของคนที่ล็อกอินอยู่จริง
      reporterName: me.profile.name,    // จดชื่อซ้ำ — หน้ารายการจะได้แสดงชื่อโดยไม่เปิด users เพิ่ม
      assigneeId: "",
      assigneeName: "",
      categoryId,
      categoryName,                     // จดชื่อซ้ำ
      createdAt: serverTimestamp(),     // วันเวลาที่แจ้ง ติดมาอัตโนมัติ
    });
    location.href = "tickets.html";
  } catch (err) {
    showError(`บันทึกไม่สำเร็จ: ${err.message} — ลองอีกครั้ง หรือตรวจว่ายังล็อกอินอยู่`);
    saveBtn.disabled = false;
    saveBtn.textContent = "บันทึก";
  }
});

async function main() {
  me = await requireLogin();
  try {
    await loadCategories();
  } catch (e) {
    showError(`โหลดหมวดหมู่ไม่สำเร็จ: ${e.message}`);
  }
}

main();
