// ═══ หน้ารายการใบแจ้งซ่อม ═══
// สัปดาห์ที่ 6: อ่านจาก Firestore จริง (ตัว R ตัวเดียว)
// ถ้ายังไม่มีไฟล์ js/firebase-config.js → fallback ไปข้อมูลปลอมพร้อมแถบเตือน

import { db } from "./firebase.js";
import { esc, statusBadge, fmtDate, markActiveNav } from "./ui.js";

markActiveNav();

const rowsEl = document.getElementById("ticket-rows");
const emptyEl = document.getElementById("empty-message");
const noticeArea = document.getElementById("notice-area");
const filterInfoEl = document.getElementById("filter-info");

// รองรับการกรองสถานะจากแดชบอร์ด เช่น tickets.html?status=แจ้งใหม่
const statusFilter = new URLSearchParams(location.search).get("status");

function render(tickets) {
  if (statusFilter) {
    tickets = tickets.filter((t) => t.status === statusFilter);
    filterInfoEl.innerHTML =
      `กรองสถานะ: ${statusBadge(statusFilter)} <a href="tickets.html">แสดงทั้งหมด</a>`;
  }

  if (tickets.length === 0) {
    emptyEl.classList.remove("hidden");
    rowsEl.innerHTML = "";
    return;
  }
  emptyEl.classList.add("hidden");

  rowsEl.innerHTML = tickets
    .map(
      (t) => `
      <tr class="clickable" data-id="${esc(t.id)}">
        <td>${esc(t.title)}</td>
        <td>${esc(t.categoryName)}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${esc(t.reporterName)}</td>
        <td>${fmtDate(t.createdAt)}</td>
      </tr>`
    )
    .join("");

  // กดแถวแล้วไปหน้ารายละเอียด
  rowsEl.querySelectorAll("tr").forEach((tr) => {
    tr.addEventListener("click", () => {
      location.href = `ticket-detail.html?id=${tr.dataset.id}`;
    });
  });
}

async function loadFromFirestore() {
  const { collection, query, orderBy, limit, getDocs } = await import(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
  );
  // เรียงใหม่ไปเก่า · จำกัดจำนวนแทนการแบ่งหน้า (pagination เป็นเนื้อหา Module 3)
  const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function loadFromFakeData() {
  // ยังไม่ได้ต่อ Firebase — ใช้ข้อมูลปลอมจาก prototype ไปก่อน
  noticeArea.innerHTML =
    `<div class="notice notice-warn">⚠️ ยังไม่ได้ต่อ Firebase — กำลังแสดงข้อมูลปลอมจาก js/data.js
     (วิธีต่อดูใน SETUP.md)</div>`;
  const { getTickets } = await import("./data.js");
  return getTickets().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function main() {
  try {
    const tickets = db ? await loadFromFirestore() : await loadFromFakeData();
    render(tickets);
  } catch (e) {
    noticeArea.innerHTML =
      `<div class="notice notice-error">อ่านข้อมูลไม่สำเร็จ: ${esc(e.message)}<br>
       ลองเปิด Firebase Console ดูว่าข้อมูลอยู่ในตู้ไหม — ถ้าอยู่ แปลว่าพังตอนอ่าน (เช่น โหมดทดสอบหมดอายุ)</div>`;
  }
}

main();
