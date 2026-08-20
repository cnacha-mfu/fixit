// ═══ หน้ารายการใบแจ้งซ่อม — แสดงข้อมูลปลอมจาก js/data.js ═══
import { getTickets } from "./data.js";
import { esc, statusBadge, fmtDate, markActiveNav } from "./ui.js";

markActiveNav();

const rowsEl = document.getElementById("ticket-rows");
const emptyEl = document.getElementById("empty-message");
const filterInfoEl = document.getElementById("filter-info");

// รองรับการกรองสถานะจากแดชบอร์ด เช่น tickets.html?status=แจ้งใหม่
const statusFilter = new URLSearchParams(location.search).get("status");

function render(tickets) {
  if (statusFilter) {
    tickets = tickets.filter((t) => t.status === statusFilter);
    filterInfoEl.innerHTML =
      `กรองสถานะ: ${statusBadge(statusFilter)} <a href="tickets.html">แสดงทั้งหมด</a>`;
  }

  // เรียงใหม่ไปเก่า
  tickets.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

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

render(getTickets());
