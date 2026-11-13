import { test, expect } from "@playwright/test";

test("every student page renders empty without records or runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "",
    "/offerings",
    "/registration",
    "/schedule",
    "/grades",
    "/degree",
    "/finance",
    "/aid",
    "/major",
    "/overrides",
    "/profile",
  ]) {
    await page.goto(`/student${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(0);
    await expect(page.getByLabel("Preview role")).toHaveValue("student");
    expect(
      await page.evaluate(() => localStorage.getItem("liu-portal-v1")),
    ).toBeNull();
  }
  await page.goto("/student");
  await page.screenshot({
    path: "test-results/student-dashboard.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("every admin page renders empty and the development role switch works", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/student");
  await page.getByLabel("Preview role").selectOption("admin");
  await expect(page).toHaveURL(/\/admin$/);
  for (const route of [
    "",
    "/students",
    "/courses",
    "/sections",
    "/settings",
    "/overrides",
    "/grades",
    "/finance",
    "/requests",
    "/assessments",
    "/gradebook",
  ]) {
    await page.goto(`/admin${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(0);
  }
  await page.goto("/admin/students");
  await page
    .getByRole("button", { name: "Create student account", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page.getByLabel("University email")).toHaveValue("");
  await expect(page.getByLabel("Major", { exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/admin/courses");
  await page.getByRole("button", { name: "Add course", exact: true }).click();
  await expect(page.getByLabel("Course code")).toHaveValue("");
  await page.getByRole("button", { name: "Save course", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("authentication has no prefilled credentials or simulated inbox", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page.getByLabel("University email")).toHaveValue("");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(
    page.getByRole("link", { name: "Preview Student", exact: true }),
  ).toBeVisible();
  await page.goto("/forgot-password");
  await expect(page.getByLabel("University email")).toHaveValue("");
  await page.goto("/reset-password");
  await expect(
    page.getByRole("button", { name: "Save password" }),
  ).toBeDisabled();
  await page.goto("/inbox");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
test("mobile layout and dropdown navigation remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/student");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/student-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.locator("summary").filter({ hasText: "Academics" }).click();
  await page
    .getByRole("link", { name: "Course offerings", exact: true })
    .click();
  await expect(page).toHaveURL(/\/student\/offerings$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("valid form submission reports backend unavailable without claiming success", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("University email").fill("admissions@liu.edu.lb");
  await page.getByRole("button", { name: "Request reset link" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Nothing has been saved or sent",
  );
  await expect(
    page.getByText("Request completed by the server.", { exact: true }),
  ).toHaveCount(0);
});
test("production build has no role switch or authentication bypass", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4173/student");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Preview role")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Preview (Student|Admin)/ }),
  ).toHaveCount(0);
  await page.goto("http://127.0.0.1:4173/admin");
  await expect(page).toHaveURL(/\/login$/);
});
