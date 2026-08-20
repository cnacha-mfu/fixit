// ═══ ข้อมูลปลอมของ prototype — คัดจาก fixit-spec.md หัวข้อ 7 ═══
// สัปดาห์ที่ 6 ยังไม่มีฐานข้อมูล ข้อมูลชุดนี้ "พิมพ์ค้างไว้ในโค้ด"
// การเพิ่ม/แก้/ลบ เก็บไว้ในตัวแปรของหน้านี้เท่านั้น (in-memory) → รีเฟรชหน้าแล้วกลับเป็นชุดเดิมทุกครั้ง
// (ชื่อทุกชื่อเป็นชื่อสมมติ ตามกติกาของหลักสูตร)

export const USERS = {
  u001: { name: "สมชาย ใจดี",  email: "somchai@example.com", role: "reporter" },
  u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "technician" },
  u003: { name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "admin" },
};

const SEED = {
  categories: [
    { id: "c001", name: "ไฟฟ้า" },
    { id: "c002", name: "ประปา" },
    { id: "c003", name: "เครื่องปรับอากาศ" },
  ],
  tickets: [
    {
      id: "t001",
      title: "แอร์ห้องประชุมใหญ่ไม่เย็น",
      detail: "เปิดแอร์ทิ้งไว้ครึ่งชั่วโมงแล้วยังไม่เย็น มีเสียงดังผิดปกติจากตัวเครื่อง",
      location: "ห้องประชุมใหญ่ ชั้น 3",
      status: "รับเรื่องแล้ว",
      reporterId: "u001", reporterName: "สมชาย ใจดี",
      assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
      categoryId: "c003", categoryName: "เครื่องปรับอากาศ",
      createdAt: "2026-09-01 09:15",
    },
    {
      id: "t002",
      title: "ไฟทางเดินชั้น 2 ดับทั้งแถว",
      detail: "หลอดไฟทางเดินหน้าห้องบัญชีดับพร้อมกัน 4 ดวง ตอนกลางคืนมืดมาก",
      location: "ทางเดินชั้น 2 หน้าห้องบัญชี",
      status: "เสร็จสิ้น",
      reporterId: "u001", reporterName: "สมชาย ใจดี",
      assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
      categoryId: "c001", categoryName: "ไฟฟ้า",
      createdAt: "2026-08-24 08:05",
    },
    {
      id: "t003",
      title: "ก๊อกน้ำห้องครัวปิดไม่สนิท",
      detail: "น้ำหยดตลอดเวลาแม้ปิดสุดแล้ว พื้นเปียกทุกเช้า",
      location: "ห้องครัวพนักงาน ชั้น 1",
      status: "แจ้งใหม่",
      reporterId: "u003", reporterName: "สมศรี ตั้งใจ",
      assigneeId: "",     assigneeName: "",
      categoryId: "c002", categoryName: "ประปา",
      createdAt: "2026-09-10 16:30",
    },
    {
      id: "t004",
      title: "ปลั๊กไฟห้องเก็บเอกสารใช้ไม่ได้",
      detail: "เสียบเครื่องทำลายเอกสารแล้วไม่ติด ลองเปลี่ยนเครื่องแล้วก็ยังไม่ติด",
      location: "ห้องเก็บเอกสาร ชั้น 2",
      status: "กำลังซ่อม",
      reporterId: "u003", reporterName: "สมศรี ตั้งใจ",
      assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
      categoryId: "c001", categoryName: "ไฟฟ้า",
      createdAt: "2026-09-20 11:00",
    },
    {
      id: "t005",
      title: "แอร์ห้องทำงานฝ่ายขายมีน้ำหยด",
      detail: "มีน้ำหยดจากตัวเครื่องลงบนโต๊ะทำงาน ต้องเอาถังมารองไว้ก่อน",
      location: "ห้องทำงานฝ่ายขาย ชั้น 4",
      status: "รับเรื่องแล้ว",
      reporterId: "u001", reporterName: "สมชาย ใจดี",
      assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
      categoryId: "c003", categoryName: "เครื่องปรับอากาศ",
      createdAt: "2026-09-18 14:45",
    },
  ],
  comments: {
    t001: [
      { authorId: "u002", authorName: "สมหญิง รักงาน",
        message: "รับเรื่องแล้วครับ ขอเข้าไปดูหน้างานช่วงบ่ายวันนี้",
        createdAt: "2026-09-01 13:40" },
      { authorId: "u003", authorName: "สมศรี ตั้งใจ",
        message: "ห้องประชุมมีนัดใช้งานวันพฤหัสฯ ขอให้เสร็จก่อนวันนั้นนะคะ",
        createdAt: "2026-09-02 10:05" },
    ],
    t002: [
      { authorId: "u002", authorName: "สมหญิง รักงาน",
        message: "เปลี่ยนหลอดไฟครบทั้ง 4 ดวงแล้ว ทดสอบติดปกติ ปิดงานได้ครับ",
        createdAt: "2026-08-24 09:20" },
    ],
    // t003 t004 t005 ยังไม่มีความคืบหน้า (ตาม spec)
  },
};

// ── ที่เก็บชั่วคราว: ตัวแปรในหน่วยความจำ (in-memory) — รีเฟรชหน้าแล้วกลับเป็นชุดเดิม ──
let memoryStore = structuredClone(SEED);

function load() {
  return memoryStore;
}

function save(store) {
  memoryStore = store;
}

function nextId(list, prefix) {
  const max = list
    .map((x) => parseInt(x.id.replace(prefix, ""), 10) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return prefix + String(max + 1).padStart(3, "0");
}

// ── ใบแจ้งซ่อม ──
export function getTickets() {
  return load().tickets;
}
export function getTicket(id) {
  return load().tickets.find((t) => t.id === id) || null;
}
export function addTicket(data) {
  const store = load();
  const id = nextId(store.tickets, "t");
  store.tickets.push({ id, ...data });
  save(store);
  return id;
}
export function updateTicketStatus(id, status) {
  const store = load();
  const t = store.tickets.find((x) => x.id === id);
  if (t) { t.status = status; save(store); }
}
export function deleteTicket(id) {
  const store = load();
  store.tickets = store.tickets.filter((t) => t.id !== id);
  delete store.comments[id];
  save(store);
}

// ── ความคืบหน้า (โฟลเดอร์ย่อย comments) ──
export function getComments(ticketId) {
  return load().comments[ticketId] || [];
}
export function addComment(ticketId, comment) {
  const store = load();
  if (!store.comments[ticketId]) store.comments[ticketId] = [];
  store.comments[ticketId].push(comment);
  save(store);
}

// ── หมวดหมู่ ──
export function getCategories() {
  return load().categories;
}
export function addCategory(name) {
  const store = load();
  const id = nextId(store.categories, "c");
  store.categories.push({ id, name });
  save(store);
  return id;
}
export function updateCategory(id, name) {
  const store = load();
  const c = store.categories.find((x) => x.id === id);
  if (c) { c.name = name; save(store); }
}
export function deleteCategory(id) {
  const store = load();
  store.categories = store.categories.filter((c) => c.id !== id);
  save(store);
}
