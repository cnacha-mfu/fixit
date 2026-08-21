// ═══ เทสต์ปุ่ม AI — เรียกไม่สำเร็จแล้วระบบต้องไม่ค้าง ═══
// วิธีเตรียม (ทำเองก่อนรัน): เปิด js/config.js แล้ววาง "คีย์ปลอม" ทับชั่วคราว
// เพื่อให้การเรียก AI ล้มแบบควบคุมได้ — เทสต์เสร็จแล้วอย่าลืมใส่คีย์จริงกลับ
// (ถ้าไม่มีไฟล์ js/config.js เลย เทสต์นี้ก็ยังใช้ได้ — ระบบต้องขึ้นข้อความแนะนำแทนการค้าง)
import { test, expect } from "@playwright/test";
import { ACCOUNTS, BASE_URL } from "./test-config.js";
import { login } from "./helpers.js";

test("เรียก AI ไม่สำเร็จ แล้วมีข้อความภาษาไทย และปุ่มอื่นยังกดได้ (ระบบไม่ค้าง)", async ({ page }) => {
  await login(page, ACCOUNTS.reporter);
  await page.goto(`${BASE_URL}/new-ticket.html`);
  await expect(page.locator("#user-name")).toBeVisible();

  // กรอกรายละเอียดแล้วกดปุ่ม AI
  await page.fill("#detail", "แอร์ห้อง 402 ไม่เย็นตั้งแต่เมื่อวาน มีน้ำหยดลงพื้นด้วย");
  await page.click("#ai-category-btn");

  // "ไม่ค้าง" ต้องแปลว่าผู้ใช้ไปต่อได้จริง ไม่ใช่หน้าจอนิ่งเฉย:
  //   1. มีข้อความภาษาไทยบอกผู้ใช้ ภายในเวลาไม่เกิน timeout 15 วินาที + เผื่อ
  await expect(page.locator("#ai-status")).not.toBeEmpty({ timeout: 25_000 });
  //   2. ปุ่ม AI กลับมากดได้อีกครั้ง (ไม่ติดสถานะกำลังทำงานค้าง)
  await expect(page.locator("#ai-category-btn")).toBeEnabled();
  //   3. ปุ่มบันทึกยังกดได้ตามปกติ — เลือกหมวดเองแล้วบันทึกต่อได้
  await expect(page.locator("#save-btn")).toBeEnabled();
});
