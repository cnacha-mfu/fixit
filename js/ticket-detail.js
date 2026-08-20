// ═══ หน้ารายละเอียดใบแจ้งซ่อม — prototype: ทำงานกับข้อมูลปลอมในตัวแปร in-memory (รีเฟรชแล้วกลับเป็นชุดเดิม) ═══
import {
  getTicket, updateTicketStatus, deleteTicket,
  getComments, addComment, USERS,
} from "./data.js";
import { esc, statusBadge, nextStatus, fmtDate, markActiveNav } from "./ui.js";

markActiveNav();

const noticeArea = document.getElementById("notice-area");
const id = new URLSearchParams(location.search).get("id");

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

function render() {
  const t = getTicket(id);
  if (!t) {
    showError("ไม่พบใบแจ้งซ่อมนี้ อาจถูกลบไปแล้ว — กลับไปหน้ารายการแล้วเลือกใหม่");
    return;
  }

  document.getElementById("ticket-card").classList.remove("hidden");
  document.getElementById("comments-card").classList.remove("hidden");

  document.getElementById("t-title").textContent = t.title;
  document.getElementById("t-status").innerHTML = statusBadge(t.status);
  document.getElementById("t-detail").textContent = t.detail;
  document.getElementById("t-category").textContent = t.categoryName;
  document.getElementById("t-location").textContent = t.location;
  document.getElementById("t-reporter").textContent = t.reporterName;
  document.getElementById("t-assignee").textContent = t.assigneeName || "ยังไม่ได้มอบหมาย";
  document.getElementById("t-created").textContent = fmtDate(t.createdAt);

  // ปุ่มเปลี่ยนสถานะ — เดินหน้าทีละขั้นตามลูกศรเท่านั้น
  const statusBtn = document.getElementById("status-btn");
  const next = nextStatus(t.status);
  if (next) {
    statusBtn.textContent = `เปลี่ยนสถานะเป็น "${next}"`;
    statusBtn.disabled = false;
  } else {
    statusBtn.textContent = "งานนี้เสร็จสิ้นแล้ว";
    statusBtn.disabled = true;
  }

  // ปุ่มลบ — กดได้เฉพาะใบที่ยังเป็น "แจ้งใหม่"
  const deleteBtn = document.getElementById("delete-btn");
  deleteBtn.disabled = t.status !== "แจ้งใหม่";
  document.getElementById("action-hint").textContent =
    t.status === "แจ้งใหม่"
      ? ""
      : "ลบได้เฉพาะใบที่สถานะยังเป็น แจ้งใหม่";

  // รายการความคืบหน้า เรียงเก่าไปใหม่
  const comments = getComments(id);
  document.getElementById("no-comments").classList.toggle("hidden", comments.length > 0);
  document.getElementById("comment-list").innerHTML = comments
    .map(
      (c) => `
      <div class="comment">
        <div>${esc(c.message)}</div>
        <div class="meta">${esc(c.authorName)} · ${fmtDate(c.createdAt)}</div>
      </div>`
    )
    .join("");
}

document.getElementById("status-btn").addEventListener("click", () => {
  const t = getTicket(id);
  const next = nextStatus(t.status);
  if (!next) return;
  updateTicketStatus(id, next); // แก้เฉพาะช่อง status
  render();
});

document.getElementById("delete-btn").addEventListener("click", () => {
  // ต้องถามยืนยันก่อนเสมอ
  const ok = confirm("ยืนยันการลบใบแจ้งซ่อมนี้? ลบแล้วเอากลับมาไม่ได้");
  if (!ok) return;
  deleteTicket(id);
  location.href = "tickets.html";
});

document.getElementById("comment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const textEl = document.getElementById("comment-text");
  const message = textEl.value.trim();
  if (!message) {
    showError("กรุณาพิมพ์ข้อความก่อนส่ง");
    return;
  }
  noticeArea.innerHTML = "";
  // prototype: ผู้เขียนเป็นสมชายไว้ก่อน — ล็อกอินจริงมาสัปดาห์ที่ 7
  addComment(id, {
    authorId: "u001",
    authorName: USERS.u001.name,
    message,
    createdAt: fmtDate(new Date()),
  });
  textEl.value = "";
  render();
});

render();
