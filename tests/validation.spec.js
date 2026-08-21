// ═══ เทสต์กรอกไม่ครบ — ระบบต้องไม่บันทึก และต้องเตือนเป็นภาษาไทย ═══
// ผู้ใช้จริงกรอกไม่ครบทุกวัน นี่ไม่ใช่กรณีพิเศษ
import { test, expect } from "@playwright/test";
import { ACCOUNTS, BASE_URL } from "./test-config.js";
import { login } from "./helpers.js";

test("กดบันทึกโดยไม่กรอกหัวข้อ แล้วระบบไม่บันทึก และมีข้อความเตือนภาษาไทย", async ({ page }) => {
  await login(page, ACCOUNTS.reporter);
  await page.goto(`${BASE_URL}/new-ticket.html`);
  await expect(page.locator("#user-name")).toBeVisible();

  // เว้นหัวข้อว่างทั้งฟอร์ม แล้วกดบันทึกเลย
  await page.click("#save-btn");

  // ต้องเห็นข้อความเตือนภาษาไทย — หน้าจอที่เงียบเฉย ๆ ผู้ใช้จะงงว่ากดแล้วเกิดอะไร
  await expect(page.locator(".notice-error")).toBeVisible();
  await expect(page.locator(".notice-error")).toContainText("กรุณากรอกหัวข้อ");

  // และต้องยังอยู่หน้าเดิม (ไม่ถูกพากลับหน้ารายการ = ไม่ได้บันทึก)
  expect(page.url()).toContain("new-ticket.html");
});
