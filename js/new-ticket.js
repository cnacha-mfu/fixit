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

// ═══ 🤖 ผู้ช่วยระดับ 1 — ปุ่มให้ AI ช่วยจัดหมวดหมู่ (สัปดาห์ที่ 8) ═══
// เส้นทาง: ผู้ใช้กด → ส่งรายละเอียด + รายชื่อหมวดที่มีจริง → ตรวจคำตอบ → เติมพร้อมป้าย
const aiBtn = document.getElementById("ai-category-btn");
const aiStatus = document.getElementById("ai-status");
const aiLabel = document.getElementById("ai-label");

aiBtn.addEventListener("click", async () => {
  const detail = document.getElementById("detail").value.trim();
  const title = document.getElementById("title").value.trim();
  if (!detail && !title) {
    return showError("กรุณากรอกหัวข้อหรือรายละเอียดก่อน แล้ว AI จะเดาหมวดหมู่จากข้อความนั้น");
  }
  noticeArea.innerHTML = "";
  aiLabel.classList.add("hidden");

  // รายชื่อหมวดหมู่ที่มีอยู่จริง — ต้องส่งไปด้วย ไม่งั้น AI จะแต่งหมวดใหม่เอง
  const categoryNames = [...categorySelect.options]
    .filter((o) => o.value)
    .map((o) => o.textContent);
  if (categoryNames.length === 0) {
    return showError("ยังไม่มีหมวดหมู่ในระบบ — เพิ่มหมวดหมู่ก่อนที่หน้า categories.html");
  }

  aiBtn.disabled = true;                       // กันกดซ้ำระหว่างรอ
  aiBtn.textContent = "🤖 กำลังให้ AI ช่วยดู...";
  aiStatus.textContent = "";

  try {
    const { callAI } = await import("./ai.js");
    const answer = await callAI(
      [
        {
          role: "user",
          content:
`ช่วยจัดหมวดหมู่ใบแจ้งซ่อมนี้

หัวข้อ: ${title}
รายละเอียด: ${detail}

หมวดหมู่ที่เลือกได้มีเท่านี้: ${categoryNames.join(" / ")}

กติกาการตอบ: ตอบเป็นชื่อหมวดหมู่ชื่อเดียวเท่านั้น ห้ามอธิบายเพิ่ม ห้ามตั้งหมวดใหม่
ตัวอย่าง 1 — รายละเอียด "หลอดไฟกะพริบ" → ไฟฟ้า
ตัวอย่าง 2 — รายละเอียด "น้ำหยดจากท่อใต้อ่าง" → ประปา`,
        },
      ],
      { mockKey: "categorize" }
    );

    // ตรวจคำตอบก่อนใช้ — ต้องเป็นหมวดหมู่ที่มีอยู่จริงเท่านั้น
    const matched = [...categorySelect.options].find(
      (o) => o.value && o.textContent === answer
    );
    if (matched) {
      categorySelect.value = matched.value;
      aiLabel.classList.remove("hidden");      // ป้าย "ข้อเสนอจาก AI"
    } else {
      aiStatus.textContent = "AI ยังจัดหมวดหมู่ให้ไม่ได้ กรุณาเลือกเอง";
      // ไม่เปลี่ยนค่าเดิม — คำตอบที่ไม่เข้าพวกห้ามไหลลงฐานข้อมูล
    }
  } catch (e) {
    aiStatus.textContent = `${e.message} — เลือกหมวดหมู่เองแล้วบันทึกได้ตามปกติ`;
  } finally {
    aiBtn.disabled = false;
    aiBtn.textContent = "🤖 ให้ AI ช่วยจัดหมวดหมู่";
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
