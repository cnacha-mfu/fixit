// ═══ หน้าจัดการหมวดหมู่ — prototype: ทำงานกับข้อมูลปลอมในตัวแปร in-memory (รีเฟรชแล้วกลับเป็นชุดเดิม) ═══
import { getCategories, addCategory, updateCategory, deleteCategory } from "./data.js";
import { esc, markActiveNav } from "./ui.js";

markActiveNav();

const noticeArea = document.getElementById("notice-area");
const rowsEl = document.getElementById("category-rows");
const emptyEl = document.getElementById("empty-message");

function showError(message) {
  noticeArea.innerHTML = `<div class="notice notice-error">${esc(message)}</div>`;
}

function render() {
  const categories = getCategories();
  emptyEl.classList.toggle("hidden", categories.length > 0);
  rowsEl.innerHTML = categories
    .map(
      (c) => `
      <tr data-id="${esc(c.id)}">
        <td>${esc(c.name)}</td>
        <td>
          <button class="btn btn-small edit-btn">แก้ไข</button>
          <button class="btn btn-small btn-danger delete-btn">ลบ</button>
        </td>
      </tr>`
    )
    .join("");

  rowsEl.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tr = btn.closest("tr");
      const current = getCategories().find((c) => c.id === tr.dataset.id);
      const name = prompt("แก้ชื่อหมวดหมู่เป็น:", current ? current.name : "");
      if (name && name.trim()) {
        updateCategory(tr.dataset.id, name.trim());
        render();
      }
    });
  });

  rowsEl.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = confirm("ยืนยันการลบหมวดหมู่นี้?");
      if (!ok) return;
      deleteCategory(btn.closest("tr").dataset.id);
      render();
    });
  });
}

document.getElementById("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("new-name");
  const name = input.value.trim();
  if (!name) {
    showError("กรุณากรอกชื่อหมวดหมู่ก่อนกดเพิ่ม");
    return;
  }
  noticeArea.innerHTML = "";
  addCategory(name);
  input.value = "";
  render();
});

render();
