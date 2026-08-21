// ═══ หน้ารายละเอียดใบแจ้งซ่อม — อ่าน/เขียน Firestore จริง ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, statusBadge, nextStatus, fmtDate, markActiveNav } from "./ui.js";
import {
  doc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, orderBy, where, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

markActiveNav();

const noticeArea = document.getElementById("notice-area");
const id = new URLSearchParams(location.search).get("id");

let me = null;      // { user, profile }
let ticket = null;  // ข้อมูลใบปัจจุบัน

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

async function loadTicket() {
  const snap = await getDoc(doc(db, "tickets", id));
  if (!snap.exists()) {
    showError("ไม่พบใบแจ้งซ่อมนี้ อาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เปิดดู — กลับไปหน้ารายการแล้วเลือกใหม่");
    return null;
  }
  return { id: snap.id, ...snap.data() };
}

function renderTicket() {
  document.getElementById("ticket-card").classList.remove("hidden");
  document.getElementById("comments-card").classList.remove("hidden");

  document.getElementById("t-title").textContent = ticket.title;
  document.getElementById("t-status").innerHTML = statusBadge(ticket.status);
  document.getElementById("t-detail").textContent = ticket.detail;
  document.getElementById("t-category").textContent = ticket.categoryName;
  document.getElementById("t-location").textContent = ticket.location;
  document.getElementById("t-reporter").textContent = ticket.reporterName;
  document.getElementById("t-assignee").textContent = ticket.assigneeName || "ยังไม่ได้มอบหมาย";
  document.getElementById("t-created").textContent = fmtDate(ticket.createdAt);

  // ปุ่มเปลี่ยนสถานะ — เดินหน้าทีละขั้นตามลูกศรเท่านั้น
  const statusBtn = document.getElementById("status-btn");
  const next = nextStatus(ticket.status);
  if (next) {
    statusBtn.textContent = `เปลี่ยนสถานะเป็น "${next}"`;
    statusBtn.disabled = false;
  } else {
    statusBtn.textContent = "งานนี้เสร็จสิ้นแล้ว";
    statusBtn.disabled = true;
  }

  // ปุ่มลบ — กดได้เฉพาะใบที่ยังเป็น "แจ้งใหม่"
  const deleteBtn = document.getElementById("delete-btn");
  deleteBtn.disabled = ticket.status !== "แจ้งใหม่";
  document.getElementById("action-hint").textContent =
    ticket.status === "แจ้งใหม่" ? "" : "ลบได้เฉพาะใบที่สถานะยังเป็น แจ้งใหม่";
}

async function renderComments() {
  // ความคืบหน้าอยู่ในโฟลเดอร์ย่อย comments ของใบนี้ เรียงเก่าไปใหม่
  const q = query(collection(db, "tickets", id, "comments"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  const comments = snap.docs.map((d) => d.data());

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

async function setupAssignArea() {
  // รายชื่อช่างซ่อม สำหรับมอบหมายงาน
  const area = document.getElementById("assign-area");
  const select = document.getElementById("assignee-select");
  try {
    const q = query(collection(db, "users"), where("role", "==", "technician"));
    const snap = await getDocs(q);
    if (snap.empty) return;
    for (const d of snap.docs) {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.data().name;
      select.appendChild(opt);
    }
    area.classList.remove("hidden");
  } catch (e) {
    console.warn("โหลดรายชื่อช่างไม่ได้:", e.message);
  }
}

document.getElementById("status-btn").addEventListener("click", async () => {
  const next = nextStatus(ticket.status);
  if (!next) return;
  try {
    // แก้เฉพาะช่อง status — ห้ามเขียนทับช่องอื่นในไฟล์เดิม
    await updateDoc(doc(db, "tickets", id), { status: next });
    ticket.status = next;
    renderTicket();
  } catch (e) {
    showError(`เปลี่ยนสถานะไม่สำเร็จ: ${e.message}`);
  }
});

document.getElementById("delete-btn").addEventListener("click", async () => {
  // ต้องถามยืนยันก่อนเสมอ — การลบข้อมูลในฐาน commit ช่วยย้อนไม่ได้
  const ok = confirm("ยืนยันการลบใบแจ้งซ่อมนี้? ลบแล้วเอากลับมาไม่ได้");
  if (!ok) return;
  try {
    await deleteDoc(doc(db, "tickets", id));
    location.href = "tickets.html";
  } catch (e) {
    showError(`ลบไม่สำเร็จ: ${e.message}`);
  }
});

document.getElementById("comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const textEl = document.getElementById("comment-text");
  const message = textEl.value.trim();
  if (!message) {
    showError("กรุณาพิมพ์ข้อความก่อนส่ง");
    return;
  }
  noticeArea.innerHTML = "";
  try {
    await addDoc(collection(db, "tickets", id, "comments"), {
      authorId: me.user.uid,
      authorName: me.profile.name,   // จดชื่อซ้ำ
      message,
      createdAt: serverTimestamp(),
    });
    textEl.value = "";
    await renderComments();
  } catch (err) {
    showError(`ส่งความคืบหน้าไม่สำเร็จ: ${err.message}`);
  }
});

document.getElementById("assign-btn").addEventListener("click", async () => {
  const select = document.getElementById("assignee-select");
  const uid = select.value;
  if (!uid) return showError("กรุณาเลือกช่างซ่อมก่อนกดมอบหมาย");
  const name = select.options[select.selectedIndex].textContent;
  try {
    await updateDoc(doc(db, "tickets", id), {
      assigneeId: uid,
      assigneeName: name,   // จดชื่อซ้ำ
    });
    ticket.assigneeId = uid;
    ticket.assigneeName = name;
    noticeArea.innerHTML = `<div class="notice notice-ok">มอบหมายให้ ${esc(name)} แล้ว</div>`;
    renderTicket();
  } catch (e) {
    showError(`มอบหมายไม่สำเร็จ: ${e.message}`);
  }
});

async function main() {
  me = await requireLogin();
  if (!id) {
    showError("ไม่ได้ระบุใบแจ้งซ่อม — กลับไปหน้ารายการแล้วกดเลือกใบที่ต้องการ");
    return;
  }
  try {
    ticket = await loadTicket();
    if (!ticket) return;
    renderTicket();
    await renderComments();
    await setupAssignArea();
  } catch (e) {
    showError(`อ่านข้อมูลไม่สำเร็จ: ${e.message}`);
  }
}

main();
