// ═══ ตัวช่วยที่เทสต์ทุกตัวใช้ร่วมกัน ═══
import { expect } from "@playwright/test";
import { BASE_URL } from "./test-config.js";

// เข้าสู่ระบบด้วยบัญชีทดสอบ แล้วรอจนถึงหน้าแรกจริง ๆ
export async function login(page, account) {
  await page.goto(`${BASE_URL}/login.html`);
  await page.fill("#email", account.email);
  await page.fill("#password", account.password);
  await page.click("#login-btn");
  await page.waitForURL("**/index.html");
  // รอจนแถบเมนูขึ้นชื่อผู้ใช้ — แปลว่าสถานะล็อกอินพร้อมแล้วจริง
  await expect(page.locator("#user-name")).toBeVisible();
}

// ออกจากระบบ (ต้องอยู่หน้าที่มีแถบเมนูของคนที่ล็อกอินอยู่)
export async function logout(page) {
  await page.click("#logout-btn");
  await page.waitForURL("**/login.html");
}

// แจ้งซ่อมใบใหม่ แล้วคืนหัวข้อที่ใช้ (ตั้งชื่อไม่ซ้ำด้วยเวลาปัจจุบัน)
export async function createTicket(page, { titlePrefix = "เทสต์อัตโนมัติ" } = {}) {
  const title = `${titlePrefix} ${Date.now()}`;
  await page.goto(`${BASE_URL}/new-ticket.html`);
  await expect(page.locator("#user-name")).toBeVisible();
  await page.fill("#title", title);
  await page.fill("#detail", "ใบแจ้งซ่อมที่สร้างโดยชุดทดสอบอัตโนมัติ ลบได้");
  // เลือกหมวดหมู่ตัวแรกที่มีจริง (รอให้รายการโหลดจาก Firestore ก่อน)
  await expect(page.locator("#category option")).not.toHaveCount(1);
  await page.locator("#category").selectOption({ index: 1 });
  await page.fill("#location", "ห้องทดสอบระบบ");
  await page.click("#save-btn");
  await page.waitForURL("**/tickets.html");
  return title;
}

// เปิดหน้ารายละเอียดของใบที่มีหัวข้อนี้ (จากหน้ารายการ) แล้วคืน URL ของหน้านั้น
export async function openTicketByTitle(page, title) {
  await page.goto(`${BASE_URL}/tickets.html`);
  const row = page.locator("tr.clickable", { hasText: title });
  await expect(row).toBeVisible();
  await row.click();
  await page.waitForURL("**/ticket-detail.html?id=*");
  return page.url();
}
