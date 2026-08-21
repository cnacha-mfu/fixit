// ═══ หน้ารายการใบแจ้งซ่อม — อ่านจาก Firestore จริง ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, statusBadge, fmtDate, markActiveNav } from "./ui.js";
import {
  collection, query, orderBy, limit, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

async function main() {
  // รอสถานะล็อกอินพร้อมก่อน แล้วค่อยอ่านข้อมูล — กัน permission denied ทั้งที่ล็อกอินอยู่
  await requireLogin();

  rowsEl.innerHTML = `<tr><td colspan="5">กำลังโหลด...</td></tr>`;
  try {
    // เรียงใหม่ไปเก่า · จำกัดจำนวนแทนการแบ่งหน้า (pagination เป็นเนื้อหา Module 3)
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    render(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    rowsEl.innerHTML = "";
    noticeArea.innerHTML =
      `<div class="notice notice-error">อ่านข้อมูลไม่สำเร็จ: ${esc(e.message)}<br>
       ถ้าขึ้น permission-denied ให้ตรวจว่าล็อกอินแล้ว และกฎใน Firebase ถูก deploy แล้ว</div>`;
  }
}

main();
