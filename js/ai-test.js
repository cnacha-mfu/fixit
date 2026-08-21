// ═══ หน้าทดสอบเรียก AI — เรียกให้สำเร็จหนึ่งครั้งก่อนทำฟีเจอร์จริง ═══
import { callAI, aiReady } from "./ai.js";

const btn = document.getElementById("send-btn");
const answerEl = document.getElementById("answer");
const noticeArea = document.getElementById("notice-area");

if (!aiReady()) {
  noticeArea.innerHTML =
    `<div class="notice notice-warn">⚠️ ยังไม่มีไฟล์ js/config.js —
     คัดลอก js/config.example.js เป็น js/config.js แล้วใส่คีย์ก่อน (ดู SETUP.md)</div>`;
}

btn.addEventListener("click", async () => {
  const message = document.getElementById("message").value.trim();
  if (!message) return;

  btn.disabled = true;               // กันกดซ้ำ
  btn.textContent = "กำลังส่ง...";
  answerEl.textContent = "รอคำตอบ...";

  try {
    const answer = await callAI([{ role: "user", content: message }], { mockKey: "test" });
    answerEl.textContent = answer;
  } catch (e) {
    answerEl.textContent = `❌ ${e.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = "ส่ง";
  }
});
