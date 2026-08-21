// ═══ หน้ารายละเอียดใบแจ้งซ่อม — อ่าน/เขียน Firestore จริง ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, statusBadge, nextStatus, fmtDate, markActiveNav } from "./ui.js";
import {
  doc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, orderBy, where, limit, serverTimestamp,
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

  // สิทธิ์ตามบทบาท (สัปดาห์ที่ 8) — หน้าจอซ่อนปุ่มให้ แต่ยามตัวจริงคือ firestore.rules
  const role = me.profile.role;
  const isStaff = role === "technician" || role === "admin";
  const isOwner = ticket.reporterId === me.user.uid;

  // ปุ่มเปลี่ยนสถานะ — เฉพาะช่างซ่อม/ผู้ดูแล · เดินหน้าทีละขั้นตามลูกศรเท่านั้น
  const statusBtn = document.getElementById("status-btn");
  const next = nextStatus(ticket.status);
  if (!isStaff) {
    statusBtn.classList.add("hidden");
  } else if (next) {
    statusBtn.textContent = `เปลี่ยนสถานะเป็น "${next}"`;
    statusBtn.disabled = false;
  } else {
    statusBtn.textContent = "งานนี้เสร็จสิ้นแล้ว";
    statusBtn.disabled = true;
  }

  // ปุ่มลบ — เจ้าของใบ (หรือผู้ดูแล) และเฉพาะใบที่ยังเป็น "แจ้งใหม่"
  const deleteBtn = document.getElementById("delete-btn");
  const canDelete = (isOwner || role === "admin") && ticket.status === "แจ้งใหม่";
  deleteBtn.disabled = !canDelete;
  document.getElementById("action-hint").textContent = canDelete
    ? ""
    : "ลบได้เฉพาะเจ้าของใบ และเฉพาะใบที่สถานะยังเป็น แจ้งใหม่";
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
  // มอบหมายช่าง — เห็นเฉพาะ admin (สัปดาห์ที่ 8 · rules บังคับซ้ำอีกชั้น)
  if (me.profile.role !== "admin") return;

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

// ═══ 🤖 ผู้ช่วยระดับ 2 (agentic) — เสนอมอบหมายช่างพร้อมเหตุผล (สัปดาห์ที่ 8) ═══
// ทำงานหลายขั้น: อ่านใบนี้ → อ่านประวัติงานที่ช่างแต่ละคนเคยปิด → เสนอชื่อพร้อมเหตุผล
// → เขียน aiSuggestion + aiLog กลับลงใบ → "คน" เป็นผู้กดยืนยันมอบหมายเสมอ
const aiSuggestBtn = document.getElementById("ai-suggest-btn");
const aiSuggestStatus = document.getElementById("ai-suggest-status");
const aiBox = document.getElementById("ai-suggestion-box");
let aiSuggested = null; // { uid, name, reason }

aiSuggestBtn.addEventListener("click", async () => {
  aiSuggestBtn.disabled = true;                 // กันกดซ้ำระหว่างรอ
  aiSuggestBtn.textContent = "🤖 กำลังอ่านข้อมูล...";
  aiSuggestStatus.textContent = "";
  aiBox.classList.add("hidden");
  aiSuggested = null;

  try {
    // ขั้นที่ 1 — อ่านรายชื่อช่างที่มีอยู่จริง
    const techSnap = await getDocs(query(collection(db, "users"), where("role", "==", "technician")));
    const technicians = techSnap.docs.map((d) => ({ uid: d.id, name: d.data().name }));
    if (technicians.length === 0) throw new Error("ยังไม่มีช่างซ่อมในระบบ — เพิ่ม role technician ให้ผู้ใช้ก่อน");

    // ขั้นที่ 2 — อ่านประวัติงานที่เสร็จสิ้นแล้ว เพื่อดูว่าใครถนัดหมวดไหน
    const doneSnap = await getDocs(
      query(collection(db, "tickets"), where("status", "==", "เสร็จสิ้น"), limit(50))
    );
    const history = {};
    for (const tech of technicians) history[tech.name] = {};
    let ticketsRead = 0;
    for (const d of doneSnap.docs) {
      const t = d.data();
      const tech = technicians.find((x) => x.uid === t.assigneeId);
      if (!tech) continue;
      history[tech.name][t.categoryName] = (history[tech.name][t.categoryName] || 0) + 1;
      ticketsRead++;
    }

    // ขั้นที่ 3 — ส่งให้ AI: เฉพาะหมวด อาการ และจำนวนงาน — ห้ามส่งอีเมลหรือข้อมูลส่วนตัว
    const historyText = technicians
      .map((tech) => {
        const items = Object.entries(history[tech.name])
          .map(([cat, n]) => `${cat} ${n} ใบ`)
          .join(" · ") || "ยังไม่มีงานที่ปิดแล้ว";
        return `- ${tech.name}: ${items}`;
      })
      .join("\n");

    aiSuggestBtn.textContent = "🤖 กำลังคิด...";
    const { callAI } = await import("./ai.js");
    const answer = await callAI(
      [
        {
          role: "user",
          content:
`ช่วยเสนอว่าควรมอบหมายใบแจ้งซ่อมนี้ให้ช่างคนไหน

ใบแจ้งซ่อม — หมวด: ${ticket.categoryName} · อาการ: ${ticket.detail}

ประวัติงานที่ช่างแต่ละคนเคยปิด:
${historyText}

กติกาการตอบ: ตอบบรรทัดเดียวรูปแบบ ชื่อช่าง|เหตุผลสั้น ๆ
เลือกได้เฉพาะชื่อในรายการข้างบนเท่านั้น ห้ามตั้งชื่อใหม่
ตัวอย่าง: สมหญิง รักงาน|เคยปิดงานหมวดไฟฟ้ามาแล้ว 3 ใบ`,
        },
      ],
      { mockKey: "assign" }
    );

    // ขั้นที่ 4 — ตรวจคำตอบ: ชื่อที่เสนอต้องเป็นช่างที่มีอยู่จริงเท่านั้น
    const [name, reason] = answer.split("|").map((s) => (s || "").trim());
    const matched = technicians.find((t) => t.name === name);
    if (!matched) {
      aiSuggestStatus.textContent = "AI เสนอชื่อที่ไม่อยู่ในรายการช่างจริง — ไม่ใช้ข้อเสนอนี้ เลือกเองได้เลย";
      return;
    }
    aiSuggested = { uid: matched.uid, name: matched.name, reason: reason || "-" };

    // ขั้นที่ 5 — เขียนข้อเสนอ + บันทึกการทำงานกลับลงใบ (ผู้ช่วยหลายขั้นต้องทิ้งบันทึกไว้เสมอ)
    const logLine = `อ่านใบเก่า ${ticketsRead} ใบ · เสนอ ${matched.name} · ${new Date().toLocaleString("th-TH")}`;
    await updateDoc(doc(db, "tickets", id), {
      aiSuggestion: `${matched.name} — ${aiSuggested.reason}`,
      aiLog: logLine,
    });

    document.getElementById("ai-suggestion-text").textContent =
      `เสนอมอบหมาย: ${matched.name} — ${aiSuggested.reason} (${logLine})`;
    aiBox.classList.remove("hidden");
  } catch (e) {
    aiSuggestStatus.textContent = `${e.message} — มอบหมายเองได้ตามปกติ`;
  } finally {
    aiSuggestBtn.disabled = false;
    aiSuggestBtn.textContent = "🤖 ให้ AI เสนอช่าง";
  }
});

// คนเป็นผู้ตัดสินเสมอ — AI เสนอได้อย่างเดียว
document.getElementById("ai-confirm-btn").addEventListener("click", async () => {
  if (!aiSuggested) return;
  try {
    await updateDoc(doc(db, "tickets", id), {
      assigneeId: aiSuggested.uid,
      assigneeName: aiSuggested.name,   // จดชื่อซ้ำ
    });
    ticket.assigneeId = aiSuggested.uid;
    ticket.assigneeName = aiSuggested.name;
    aiBox.classList.add("hidden");
    noticeArea.innerHTML = `<div class="notice notice-ok">มอบหมายให้ ${esc(aiSuggested.name)} ตามข้อเสนอของ AI แล้ว</div>`;
    renderTicket();
  } catch (e) {
    showError(`มอบหมายไม่สำเร็จ: ${e.message}`);
  }
});

document.getElementById("ai-dismiss-btn").addEventListener("click", () => {
  aiBox.classList.add("hidden");
  aiSuggested = null;
  aiSuggestStatus.textContent = "ไม่ใช้ข้อเสนอของ AI — เลือกช่างเองจากรายการได้เลย";
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
