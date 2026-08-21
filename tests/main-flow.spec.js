// ═══ เทสต์เส้นทางหลัก 6 ขั้น — ถ้าเส้นนี้พัง ระบบใช้ไม่ได้เลย ═══
// แจ้งซ่อม → มอบหมายช่าง → รับเรื่อง → กำลังซ่อม → ปิดงาน → รายการแสดง "เสร็จสิ้น"
import { test, expect } from "@playwright/test";
import { ACCOUNTS, BASE_URL } from "./test-config.js";
import { login, logout, createTicket, openTicketByTitle } from "./helpers.js";

test("เส้นทางหลัก: แจ้งซ่อม มอบหมาย ซ่อม ปิดงาน แล้วรายการแสดงสถานะ เสร็จสิ้น", async ({ page }) => {
  // ขั้นที่ 1 — ผู้แจ้ง (สมชาย) แจ้งซ่อมใบใหม่
  await login(page, ACCOUNTS.reporter);
  const title = await createTicket(page, { titlePrefix: "เทสต์เส้นทางหลัก" });

  // ใบใหม่ต้องโผล่ในหน้ารายการ สถานะ แจ้งใหม่
  const row = page.locator("tr.clickable", { hasText: title });
  await expect(row).toBeVisible();
  await expect(row.locator(".badge")).toHaveText("แจ้งใหม่");

  // ขั้นที่ 2 — ผู้ดูแล (สมศรี) มอบหมายช่างสมหญิง
  await logout(page);
  await login(page, ACCOUNTS.admin);
  const detailUrl = await openTicketByTitle(page, title);
  await expect(page.locator("#assign-area")).toBeVisible();
  await page.locator("#assignee-select").selectOption({ label: ACCOUNTS.technician.name });
  await page.click("#assign-btn");
  await expect(page.locator("#t-assignee")).toHaveText(ACCOUNTS.technician.name);

  // ขั้นที่ 3–5 — ช่าง (สมหญิง) เดินสถานะทีละขั้น: รับเรื่องแล้ว → กำลังซ่อม → เสร็จสิ้น
  await logout(page);
  await login(page, ACCOUNTS.technician);
  await page.goto(detailUrl);
  for (const next of ["รับเรื่องแล้ว", "กำลังซ่อม", "เสร็จสิ้น"]) {
    await expect(page.locator("#status-btn")).toContainText(next);
    await page.click("#status-btn");
    await expect(page.locator("#t-status .badge")).toHaveText(next);
  }
  // เสร็จสิ้นแล้ว ปุ่มต้องเปลี่ยนต่อไม่ได้ (สถานะปลายทาง)
  await expect(page.locator("#status-btn")).toBeDisabled();

  // ขั้นที่ 6 — เปิดหน้ารายการอีกครั้ง สถานะที่เห็นต้องเป็น เสร็จสิ้น
  // (ตรวจว่าข้อมูลในฐานเปลี่ยนจริง ไม่ใช่หน้าจอเด้งเฉย ๆ)
  await page.goto(`${BASE_URL}/tickets.html`);
  const doneRow = page.locator("tr.clickable", { hasText: title });
  await expect(doneRow).toBeVisible();
  await expect(doneRow.locator(".badge")).toHaveText("เสร็จสิ้น");
});
