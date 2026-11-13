import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const baseURL = process.argv[2];
if (!baseURL) throw new Error("Usage: node scripts/verify-deployment.mjs <production-url>");
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "msedge" });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/programs", "/programs/arts-sciences-computer-science", "/courses", "/admissions", "/tuition", "/login"]) {
      const response = await page.goto(new URL(route, baseURL).href);
      assert.equal(response.status(), 200, `Direct visit failed: ${route}`);
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      const refresh = await page.reload();
      assert.equal(refresh.status(), 200, `Refresh failed: ${route}`);
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow: ${route}`);
    }
    for (const route of ["/student", "/admin"]) {
      await page.goto(new URL(route, baseURL).href);
      await page.waitForURL("**/login");
      assert.equal(await page.getByLabel("Preview role").count(), 0);
    }
    assert.deepEqual(errors, [], "Browser runtime errors");
    console.log(`PASS: ${viewport.width}px direct routes, refreshes, layout and production portal redirects`);
    await page.close();
  }
} finally {
  await browser.close();
}
