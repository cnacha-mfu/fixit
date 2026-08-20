// ═══ หน้าแดชบอร์ดสรุป — prototype: นับจากข้อมูลปลอมใน js/data.js ═══
import { getTickets } from "./data.js";
import { esc, statusBadge, fmtDate, markActiveNav, STATUS_FLOW } from "./ui.js";

markActiveNav();

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

  // 5 รายการล่าสุด
  const latest = [...tickets]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);
  document.getElementById("latest-rows").innerHTML = latest
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

render(getTickets());
