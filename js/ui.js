// ═══ ตัวช่วยแสดงผลที่ใช้ร่วมกันทุกหน้า ═══

// สถานะใช้ได้ 4 ค่านี้เท่านั้น เรียงตามลำดับการเปลี่ยน (ตาม fixit-spec.md หัวข้อ 6)
export const STATUS_FLOW = ["แจ้งใหม่", "รับเรื่องแล้ว", "กำลังซ่อม", "เสร็จสิ้น"];

const STATUS_CLASS = {
  "แจ้งใหม่": "s-new",
  "รับเรื่องแล้ว": "s-ack",
  "กำลังซ่อม": "s-fixing",
  "เสร็จสิ้น": "s-done",
};

// กันข้อความผู้ใช้ปนโค้ด HTML (ปลอดภัยไว้ก่อนเสมอ)
export function esc(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

// ป้ายสถานะเป็นสี — แจ้งใหม่ เทา · รับเรื่องแล้ว ฟ้า · กำลังซ่อม เหลือง · เสร็จสิ้น เขียว
export function statusBadge(status) {
  const cls = STATUS_CLASS[status] || "s-new";
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

// สถานะถัดไปตามลูกศร (เสร็จสิ้นแล้วเปลี่ยนต่อไม่ได้ → คืน null)
export function nextStatus(status) {
  const i = STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

// แปลงวันเวลาให้อ่านง่าย — รับได้ทั้งข้อความ "2026-09-01 09:15",
// Date และ Timestamp ของ Firestore (มีเมธอด toDate)
export function fmtDate(value) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const d = typeof value.toDate === "function" ? value.toDate() : value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ไฮไลต์เมนูของหน้าปัจจุบัน
export function markActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".topbar nav a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}
