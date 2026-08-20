// ═══ หน้าแจ้งซ่อมใหม่ — prototype: บันทึกลงตัวแปร in-memory (รีเฟรชหน้าแล้วหาย) ═══
import { getCategories, addTicket, USERS } from "./data.js";
import { esc, fmtDate, markActiveNav } from "./ui.js";

markActiveNav();

const form = document.getElementById("ticket-form");
const noticeArea = document.getElementById("notice-area");
const categorySelect = document.getElementById("category");

// เติมหมวดหมู่ลงรายการเลื่อนลง
for (const c of getCategories()) {
  const opt = document.createElement("option");
  opt.value = c.id;
  opt.textContent = c.name;
  categorySelect.appendChild(opt);
}

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const detail = document.getElementById("detail").value.trim();
  const categoryId = categorySelect.value;
  const location_ = document.getElementById("location").value.trim();

  // ตรวจข้อมูลก่อนบันทึก — กรอกไม่ครบต้องเตือนเป็นภาษาไทยและไม่บันทึก
  if (!title) return showError("กรุณากรอกหัวข้อ");
  if (!detail) return showError("กรุณากรอกรายละเอียดอาการ");
  if (!categoryId) return showError("กรุณาเลือกหมวดหมู่");
  if (!location_) return showError("กรุณากรอกสถานที่");

  const category = getCategories().find((c) => c.id === categoryId);

  // prototype: ผู้แจ้งเป็นสมชายไว้ก่อน — ล็อกอินจริงมาสัปดาห์ที่ 7
  addTicket({
    title,
    detail,
    location: location_,
    status: "แจ้งใหม่",            // ระบบตั้งให้อัตโนมัติ
    reporterId: "u001",
    reporterName: USERS.u001.name,
    assigneeId: "",
    assigneeName: "",
    categoryId,
    categoryName: category ? category.name : "",
    createdAt: fmtDate(new Date()), // วันเวลาที่แจ้ง ติดมาอัตโนมัติ
  });

  location.href = "tickets.html";
});
