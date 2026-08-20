// ═══ seed — ใส่ข้อมูลตัวอย่างลง Firestore (จาก fixit-spec.md หัวข้อ 7) ═══
// ไฟล์นี้เก็บข้อมูลตัวอย่างของตัวเองครบชุด เพื่อให้ seed ซ้ำได้เสมอ
// ชื่อโฟลเดอร์และชื่อช่องข้อมูลสะกดตาม spec เป๊ะ ๆ — Firestore แยกตัวพิมพ์เล็ก-ใหญ่

import { db } from "./firebase.js";
import {
  doc, setDoc, Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const logEl = document.getElementById("log");
const btn = document.getElementById("seed-btn");

function log(line) {
  logEl.textContent += "\n" + line;
}

// แปลง "2026-09-01 09:15" → Timestamp ของ Firestore
function ts(text) {
  return Timestamp.fromDate(new Date(text.replace(" ", "T") + ":00"));
}

const SEED_USERS = {
  u001: { name: "สมชาย ใจดี",  email: "somchai@example.com", role: "reporter" },
  u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "technician" },
  u003: { name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "admin" },
};

const SEED_CATEGORIES = {
  c001: { name: "ไฟฟ้า" },
  c002: { name: "ประปา" },
  c003: { name: "เครื่องปรับอากาศ" },
};

const SEED_TICKETS = {
  t001: {
    title: "แอร์ห้องประชุมใหญ่ไม่เย็น",
    detail: "เปิดแอร์ทิ้งไว้ครึ่งชั่วโมงแล้วยังไม่เย็น มีเสียงดังผิดปกติจากตัวเครื่อง",
    location: "ห้องประชุมใหญ่ ชั้น 3",
    status: "รับเรื่องแล้ว",
    reporterId: "u001", reporterName: "สมชาย ใจดี",
    assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
    categoryId: "c003", categoryName: "เครื่องปรับอากาศ",
    createdAt: ts("2026-09-01 09:15"),
  },
  t002: {
    title: "ไฟทางเดินชั้น 2 ดับทั้งแถว",
    detail: "หลอดไฟทางเดินหน้าห้องบัญชีดับพร้อมกัน 4 ดวง ตอนกลางคืนมืดมาก",
    location: "ทางเดินชั้น 2 หน้าห้องบัญชี",
    status: "เสร็จสิ้น",
    reporterId: "u001", reporterName: "สมชาย ใจดี",
    assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
    categoryId: "c001", categoryName: "ไฟฟ้า",
    createdAt: ts("2026-08-24 08:05"),
  },
  t003: {
    title: "ก๊อกน้ำห้องครัวปิดไม่สนิท",
    detail: "น้ำหยดตลอดเวลาแม้ปิดสุดแล้ว พื้นเปียกทุกเช้า",
    location: "ห้องครัวพนักงาน ชั้น 1",
    status: "แจ้งใหม่",
    reporterId: "u003", reporterName: "สมศรี ตั้งใจ",
    assigneeId: "",     assigneeName: "",
    categoryId: "c002", categoryName: "ประปา",
    createdAt: ts("2026-09-10 16:30"),
  },
  t004: {
    title: "ปลั๊กไฟห้องเก็บเอกสารใช้ไม่ได้",
    detail: "เสียบเครื่องทำลายเอกสารแล้วไม่ติด ลองเปลี่ยนเครื่องแล้วก็ยังไม่ติด",
    location: "ห้องเก็บเอกสาร ชั้น 2",
    status: "กำลังซ่อม",
    reporterId: "u003", reporterName: "สมศรี ตั้งใจ",
    assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
    categoryId: "c001", categoryName: "ไฟฟ้า",
    createdAt: ts("2026-09-20 11:00"),
  },
  t005: {
    title: "แอร์ห้องทำงานฝ่ายขายมีน้ำหยด",
    detail: "มีน้ำหยดจากตัวเครื่องลงบนโต๊ะทำงาน ต้องเอาถังมารองไว้ก่อน",
    location: "ห้องทำงานฝ่ายขาย ชั้น 4",
    status: "รับเรื่องแล้ว",
    reporterId: "u001", reporterName: "สมชาย ใจดี",
    assigneeId: "u002", assigneeName: "สมหญิง รักงาน",
    categoryId: "c003", categoryName: "เครื่องปรับอากาศ",
    createdAt: ts("2026-09-18 14:45"),
  },
};

// โฟลเดอร์ย่อย comments — t003 t004 t005 ว่างไว้ตาม spec
const SEED_COMMENTS = {
  t001: {
    cm001: { authorId: "u002", authorName: "สมหญิง รักงาน",
             message: "รับเรื่องแล้วครับ ขอเข้าไปดูหน้างานช่วงบ่ายวันนี้",
             createdAt: ts("2026-09-01 13:40") },
    cm002: { authorId: "u003", authorName: "สมศรี ตั้งใจ",
             message: "ห้องประชุมมีนัดใช้งานวันพฤหัสฯ ขอให้เสร็จก่อนวันนั้นนะคะ",
             createdAt: ts("2026-09-02 10:05") },
  },
  t002: {
    cm003: { authorId: "u002", authorName: "สมหญิง รักงาน",
             message: "เปลี่ยนหลอดไฟครบทั้ง 4 ดวงแล้ว ทดสอบติดปกติ ปิดงานได้ครับ",
             createdAt: ts("2026-08-24 09:20") },
  },
};

async function runSeed() {
  btn.disabled = true;
  logEl.textContent = "เริ่มใส่ข้อมูล...";

  try {
    for (const [id, data] of Object.entries(SEED_USERS)) {
      await setDoc(doc(db, "users", id), data);
      log(`✅ users/${id} — ${data.name}`);
    }
    for (const [id, data] of Object.entries(SEED_CATEGORIES)) {
      await setDoc(doc(db, "categories", id), data);
      log(`✅ categories/${id} — ${data.name}`);
    }
    for (const [id, data] of Object.entries(SEED_TICKETS)) {
      await setDoc(doc(db, "tickets", id), data);
      log(`✅ tickets/${id} — ${data.title}`);
    }
    for (const [ticketId, comments] of Object.entries(SEED_COMMENTS)) {
      for (const [id, data] of Object.entries(comments)) {
        await setDoc(doc(db, "tickets", ticketId, "comments", id), data);
        log(`✅ tickets/${ticketId}/comments/${id}`);
      }
    }
    log("\n🎉 เพิ่มข้อมูลครบแล้ว — เปิด Firebase Console ตรวจด้วยตาได้เลย");
  } catch (e) {
    log(`\n❌ ใส่ข้อมูลไม่สำเร็จ: ${e.message}`);
    log("ตรวจ 3 อย่าง: 1) เปิด Firestore ในโปรเจกต์แล้วหรือยัง 2) โหมดทดสอบหมดอายุหรือยัง 3) ถ้าใช้กฎต้องล็อกอิน ให้ล็อกอินก่อน");
  } finally {
    btn.disabled = false;
  }
}

if (!db) {
  logEl.textContent =
    "❌ ยังไม่ได้ต่อ Firebase — คัดลอก js/firebase-config.example.js เป็น js/firebase-config.js แล้ววางค่าจริงก่อน (ดู SETUP.md)";
  btn.disabled = true;
} else {
  btn.addEventListener("click", runSeed);
}
