import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDirectory = path.resolve("qa-screenshots");
await fs.mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

async function createPage(viewport, route = "/") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => console.error("Browser page error:", error.message));
  page.on("console", (message) => {
    if (message.type() === "error") console.error("Browser console error:", message.text());
  });
  const response = await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1100);
  console.info("QA page:", response?.status(), await page.title(), await page.locator("#root").count());
  return page;
}

async function createMockAdminPage(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const sampleLead = {
    _id: "665f155c6900a1373ac88f00",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 98765 43210",
    service: "GST Returns",
    message: "We need monthly GST return support for our growing retail business.",
    status: "new",
    adminNotes: "",
    createdAt: new Date().toISOString(),
  };

  await page.route("**/api/admin/me", (route) =>
    route.fulfill({ json: { authenticated: true, email: "owner@kini.example" } }),
  );
  await page.route("**/api/admin/stats", (route) =>
    route.fulfill({
      json: { total: 32, new: 8, contacted: 12, inProgress: 7, completed: 5, recent: 9 },
    }),
  );
  await page.route("**/api/admin/consultations?*", (route) =>
    route.fulfill({
      json: { items: [sampleLead], pagination: { page: 1, pages: 1, total: 1 } },
    }),
  );

  const response = await page.goto("http://127.0.0.1:5173/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  console.info("Mock admin QA:", response?.status(), await page.title());
  return page;
}

async function captureAtSection(name, viewport, selector, progress = 0) {
  const page = await createPage(viewport);
  if (selector) {
    const scrollY = await page.locator(selector).evaluate((element, ratio) => {
      const rect = element.getBoundingClientRect();
      const sectionStart = window.scrollY + rect.top;
      const availableScroll = Math.max(0, element.offsetHeight - window.innerHeight);
      return sectionStart + availableScroll * ratio;
    }, progress);
    await page.evaluate((nextScrollY) => window.scrollTo(0, nextScrollY), scrollY);
    await page.waitForTimeout(1400);
    if (selector === "#services") {
      console.info(
        "Service detail style:",
        await page.locator(".service-detail > div").evaluate((element) => ({
          opacity: getComputedStyle(element).opacity,
          filter: getComputedStyle(element).filter,
          text: element.querySelector("h3")?.textContent,
        })),
      );
    }
  }
  await page.screenshot({ path: path.join(outputDirectory, name), fullPage: false });
  await page.close();
}

await captureAtSection("qa-hero-desktop.png", { width: 1440, height: 1000 });
await captureAtSection("qa-hero-mobile.png", { width: 390, height: 844 });
await captureAtSection("qa-wave-desktop.png", { width: 1440, height: 1000 }, "#approach", 0.22);
await captureAtSection("qa-services-desktop.png", { width: 1440, height: 1000 }, "#services", 0.46);
await captureAtSection("qa-about-desktop.png", { width: 1440, height: 1000 }, "#about", 0);
await captureAtSection("qa-services-mobile.png", { width: 390, height: 844 }, "#services", 0);

const modalPage = await createPage({ width: 1440, height: 1000 });
await modalPage.locator(".hero-actions .primary-button").click();
await modalPage.waitForTimeout(500);
await modalPage.screenshot({ path: path.join(outputDirectory, "qa-consultation-modal.png"), fullPage: false });
await modalPage.close();

const mobileModalPage = await createPage({ width: 390, height: 844 });
await mobileModalPage.locator(".hero-actions .primary-button").click();
await mobileModalPage.waitForTimeout(500);
await mobileModalPage.screenshot({ path: path.join(outputDirectory, "qa-consultation-modal-mobile.png"), fullPage: false });
await mobileModalPage.close();

const adminPage = await createPage({ width: 1440, height: 1000 }, "/admin");
await adminPage.screenshot({ path: path.join(outputDirectory, "qa-admin-login.png"), fullPage: false });
await adminPage.close();

const adminMobilePage = await createPage({ width: 390, height: 844 }, "/admin");
await adminMobilePage.screenshot({ path: path.join(outputDirectory, "qa-admin-login-mobile.png"), fullPage: false });
await adminMobilePage.close();

const adminDashboardPage = await createMockAdminPage({ width: 1440, height: 1000 });
await adminDashboardPage.screenshot({ path: path.join(outputDirectory, "qa-admin-dashboard.png"), fullPage: false });
await adminDashboardPage.locator(".admin-table tbody button").click();
await adminDashboardPage.waitForTimeout(400);
await adminDashboardPage.screenshot({ path: path.join(outputDirectory, "qa-admin-lead-drawer.png"), fullPage: false });
await adminDashboardPage.close();

const adminDashboardMobilePage = await createMockAdminPage({ width: 390, height: 844 });
await adminDashboardMobilePage.screenshot({ path: path.join(outputDirectory, "qa-admin-dashboard-mobile.png"), fullPage: false });
await adminDashboardMobilePage.close();

await browser.close();
