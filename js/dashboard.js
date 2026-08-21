// ═══ หน้าแดชบอร์ดสรุป — นับจากข้อมูลจริงใน Firestore (ห้ามใส่ตัวเลขค้างไว้ในโค้ด) ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, statusBadge, fmtDate, markActiveNav, STATUS_FLOW } from "./ui.js";
import {
  collection, query, orderBy, limit, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

markActiveNav();

const noticeArea = document.getElementById("notice-area");

function render(tickets) {
  // กล่องตัวเลข 4 กล่อง — กดแล้วไปหน้ารายการพร้อมกรองสถานะนั้น
  document.getElementById("stat-grid").innerHTML = STATUS_FLOW
    .map((status) => {
      const count = tickets.filter((t) => t.status === status).length;
      return `
        <a class="stat-box" href="tickets.html?status=${encodeURIComponent(status)}">
          <div class="num">${count}</div>
          <div>${statusBadge(status)}</div>
        </a>`;
    })
    .join("");

  // 5 รายการล่าสุด (ข้อมูลเรียงใหม่ไปเก่าอยู่แล้วจาก query)
  document.getElementById("latest-rows").innerHTML = tickets
    .slice(0, 5)
    .map(
      (t) => `
      <tr class="clickable" data-id="${esc(t.id)}">
        <td>${esc(t.title)}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${fmtDate(t.createdAt)}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll("#latest-rows tr").forEach((tr) => {
    tr.addEventListener("click", () => {
      location.href = `ticket-detail.html?id=${tr.dataset.id}`;
    });
  });
}

async function main() {
  await requireLogin();
  try {
    // จำกัด 100 ใบล่าสุดแทนการแบ่งหน้า (pagination เป็นเนื้อหา Module 3)
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    render(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    noticeArea.innerHTML =
      `<div class="notice notice-error">อ่านข้อมูลไม่สำเร็จ: ${esc(e.message)}</div>`;
  }
}

main();
