// ═══ หน้าจัดการหมวดหมู่ — อ่าน/เขียน Firestore จริง ═══
import { db } from "./firebase.js";
import { requireLogin } from "./guard.js";
import { esc, markActiveNav } from "./ui.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

markActiveNav();

const noticeArea = document.getElementById("notice-area");
const rowsEl = document.getElementById("category-rows");
const emptyEl = document.getElementById("empty-message");

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

async function render() {
  const snap = await getDocs(collection(db, "categories"));
  const categories = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));

  emptyEl.classList.toggle("hidden", categories.length > 0);
  rowsEl.innerHTML = categories
    .map(
      (c) => `
      <tr data-id="${esc(c.id)}" data-name="${esc(c.name)}">
        <td>${esc(c.name)}</td>
        <td>
          <button class="btn btn-small edit-btn">แก้ไข</button>
          <button class="btn btn-small btn-danger delete-btn">ลบ</button>
        </td>
      </tr>`
    )
    .join("");

  rowsEl.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tr = btn.closest("tr");
      const name = prompt("แก้ชื่อหมวดหมู่เป็น:", tr.dataset.name);
      if (!name || !name.trim()) return;
      try {
        await updateDoc(doc(db, "categories", tr.dataset.id), { name: name.trim() });
        await render();
      } catch (e) {
        showError(`แก้ไขไม่สำเร็จ: ${e.message}`);
      }
    });
  });

  rowsEl.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = confirm("ยืนยันการลบหมวดหมู่นี้? ใบแจ้งซ่อมเก่าที่ใช้หมวดนี้จะยังแสดงชื่อเดิม");
      if (!ok) return;
      try {
        await deleteDoc(doc(db, "categories", btn.closest("tr").dataset.id));
        await render();
      } catch (e) {
        showError(`ลบไม่สำเร็จ: ${e.message}`);
      }
    });
  });
}

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("new-name");
  const name = input.value.trim();
  if (!name) {
    showError("กรุณากรอกชื่อหมวดหมู่ก่อนกดเพิ่ม");
    return;
  }
  noticeArea.innerHTML = "";
  try {
    await addDoc(collection(db, "categories"), { name });
    input.value = "";
    await render();
  } catch (err) {
    showError(`เพิ่มไม่สำเร็จ: ${err.message} — หน้านี้สำหรับผู้ดูแลระบบ ตรวจว่า role ของคุณเป็น admin`);
  }
});

async function main() {
  await requireLogin();
  try {
    await render();
  } catch (e) {
    showError(`อ่านข้อมูลไม่สำเร็จ: ${e.message}`);
  }
}

main();
