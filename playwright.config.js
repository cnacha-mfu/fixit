// ═══ ตั้งค่า Playwright — ชุดทดสอบต้นแบบของ FixIt (สัปดาห์ที่ 9) ═══
// วิธีติดตั้งและรัน: อ่าน tests/README.md
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,          // หน้าเว็บจริงบางจังหวะช้า — ให้เวลาเต็มที่ 1 นาทีต่อเทสต์
  retries: 0,
  workers: 1,               // รันทีละตัว — เทสต์ใช้บัญชีจริงบนระบบจริง อย่าให้แย่งกัน
  reporter: [["list"]],
  use: {
    locale: "th-TH",
    screenshot: "only-on-failure",
  },
});
