import { test, expect } from "@playwright/test";

test("public pages and every program detail render without runtime errors", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/about",
    "/schools",
    "/programs",
    "/admissions",
    "/tuition",
    "/campuses",
    "/contact",
    "/sources",
    "/policies",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await page.goto("/programs");
  await expect(page.locator(".program-card")).toHaveCount(68);
  const urls = await page
    .locator(".program-card")
    .evaluateAll((cards) =>
      cards.map(
        (c) =>
          c.getAttribute("href") || c.querySelector("a")?.getAttribute("href"),
      ),
    );
  expect(urls).toHaveLength(68);
  for (const url of urls) {
    await page.goto(url);
    await expect(page.locator(".detail-facts")).toContainText("credits");
    await expect(
      page.getByRole("heading", { name: "Academic plan" }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("program search, filters, empty state and program details work", async ({
  page,
}) => {
  await page.goto("/programs");
  await page
    .getByLabel("Search programs", { exact: true })
    .fill("Computer Science");
  await page
    .getByLabel("Filter programs by level")
    .selectOption("Undergraduate");
  await expect(page.locator(".program-card")).toHaveCount(1);
  await page.locator(".program-card").click();
  await expect(page.locator(".detail-facts")).toContainText("credits");
  await expect(page.locator(".verification-warning")).toHaveCount(0);
  await page.goto("/programs?q=unmatched-search-term");
  await expect(
    page.getByText("No programs match your search.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".program-card")).toHaveCount(68);
});

test("admissions checklist is interactive and tuition rates are available", async ({
  page,
}) => {
  await page.goto("/admissions");
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByRole("button", { name: "Graduate", exact: true }).click();
  await expect(page.getByRole("checkbox").first()).not.toBeChecked();
  await page.goto("/tuition");
  await expect(page.locator(".project-policy-callout")).toContainText(
    "separate system policies",
  );
  await expect(page.locator(".fee-list")).toContainText("LBP 500,000 + USD 10");
  await page.goto("http://127.0.0.1:4173/programs");
  await expect(page.locator(".program-card")).toHaveCount(68);
});

test("public homepage and mobile navigation have no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.screenshot({
    path: "test-results/public-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/programs",
    "/tuition",
    "/admissions",
    "/campuses",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.screenshot({
    path: "test-results/public-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle public navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Programs", exact: true })
    .click();
  await expect(page).toHaveURL(/\/programs$/);
});

test("public pages contain only internal navigation and clean client copy", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/about",
    "/schools",
    "/programs",
    "/programs/arts-sciences-computer-science",
    "/admissions",
    "/tuition",
    "/campuses",
    "/contact",
    "/policies",
    "/sources",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    const copy = await page.locator("body").innerText();
    expect(copy).not.toMatch(
      /\bISD\b|unofficial|academic project|demo system|verified|verification date|research warnings|legacy official|source clarification/i,
    );
    expect(await page.locator('a[href^="http"]').count()).toBe(0);
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    expect(
      links.every(
        (href) =>
          href.startsWith("/") ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:"),
      ),
    ).toBe(true);
  }
  await expect(page).toHaveURL(/\/about$/);
  await expect(page).toHaveTitle("LIU · Student Services");
});
