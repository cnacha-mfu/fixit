// ═══ ตัวเรียก OpenRouter จุดเดียวของทั้งเว็บ ═══
//
// กติกาความปลอดภัยของปุ่ม AI (ตาม spec US-09):
//   - รอเกิน 15 วินาที หรือเรียกไม่สำเร็จ → โยน Error ภาษาไทย ระบบต้องไม่ค้าง
//   - คีย์และชื่อโมเดลอ่านจาก js/config.js เท่านั้น (ไฟล์นั้นถูก .gitignore กันไว้)
//   - USE_MOCK = true → อ่านคำตอบตัวอย่างจาก mock-ai-response.json แทนการเรียกจริง

let config = null;
try {
  config = await import("./config.js");
} catch (e) {
  console.warn("ยังไม่มีไฟล์ js/config.js — ปุ่ม AI จะใช้ไม่ได้:", e.message);
}

export function aiReady() {
  return config !== null;
}

// เรียก AI แล้วคืนข้อความคำตอบ (string)
//   messages = [{ role: "user", content: "..." }, ...]
//   mockKey  = คีย์ในไฟล์ mock-ai-response.json ที่ใช้ตอบเมื่อ USE_MOCK เปิดอยู่
export async function callAI(messages, { mockKey = "test", timeoutMs = 15000 } = {}) {
  if (!config) {
    throw new Error(
      "ยังไม่ได้ตั้งค่าปุ่ม AI — คัดลอก js/config.example.js เป็น js/config.js แล้วใส่คีย์ก่อน (ดู SETUP.md)"
    );
  }

  // โหมดจำลอง — แผนสำรองตอน OpenRouter ล่ม
  if (config.USE_MOCK) {
    const res = await fetch("mock-ai-response.json");
    const mock = await res.json();
    await new Promise((r) => setTimeout(r, 800)); // หน่วงนิดหน่อยให้เห็นสถานะโหลด
    return mock[mockKey] || mock.test;
  }

  // กันการรอไม่รู้จบ — เกิน 15 วินาทีให้ตัดทิ้ง
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: config.MODEL, messages }),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("คีย์ OpenRouter ไม่ถูกต้องหรือหมดวงเงิน — ตรวจคีย์ใน js/config.js");
      }
      if (res.status === 429) {
        throw new Error("เรียกถี่เกินไป (rate limit) — พักสักครู่ หรือสลับโมเดลสำรองใน js/config.js");
      }
      throw new Error(`เรียก AI ไม่สำเร็จ (รหัส ${res.status}) — ลองใหม่ หรือสลับโมเดลสำรอง`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI ตอบกลับมาแบบว่างเปล่า — ลองใหม่อีกครั้ง");
    return content.trim();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("รอคำตอบเกิน 15 วินาที — ยกเลิกให้แล้ว ระบบใช้งานต่อได้ตามปกติ");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
