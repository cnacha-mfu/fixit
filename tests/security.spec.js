// ═══ เทสต์ความปลอดภัย — ตัวที่ "เข้าไม่ได้ = ผ่าน" ═══
// ⚠️ เทสต์นี้กลับหัวกับตัวอื่น: ผ่านเมื่อระบบ "ปฏิเสธ" คนที่ไม่ใช่เจ้าของ
// ถ้าเปิดดูได้ แปลว่าข้อมูลรั่วจริง — กฎเฝ้าข้อมูล (Security Rules) ไม่ทำงาน
import { test, expect } from "@playwright/test";
import { ACCOUNTS } from "./test-config.js";
import { login, logout, createTicket, openTicketByTitle } from "./helpers.js";

test("ผู้แจ้งเปิดใบแจ้งซ่อมของคนอื่นไม่ได้ และมีข้อความบอกผู้ใช้", async ({ page }) => {
  // เตรียมของ: ผู้ดูแล (สมศรี) สร้างใบแจ้งซ่อมของตัวเองไว้หนึ่งใบ
  await login(page, ACCOUNTS.admin);
  const title = await createTicket(page, { titlePrefix: "เทสต์ความปลอดภัย" });
  const detailUrl = await openTicketByTitle(page, title);

  // สลับเป็นผู้แจ้ง (สมชาย) แล้วพยายามเปิด URL ใบของสมศรีตรง ๆ
  await logout(page);
  await login(page, ACCOUNTS.reporter);
  await page.goto(detailUrl);

  // ✅ ผ่านเมื่อระบบไม่ยอมให้เข้า:
  //   1. ข้อมูลใบแจ้งซ่อมต้องไม่ปรากฏ
  await expect(page.locator("#ticket-card")).toBeHidden();
  //   2. และมีข้อความบอกผู้ใช้ ไม่ใช่จอเงียบ ๆ
  await expect(page.locator(".notice-error")).toBeVisible();

  // ❌ ถ้าใบแจ้งซ่อมแสดงขึ้นมา เทสต์นี้จะ fail
  //    → รายงานว่าข้อมูลรั่ว พร้อมสิ่งที่มองเห็น — ให้ไปตรวจ firestore.rules ทันที
});
