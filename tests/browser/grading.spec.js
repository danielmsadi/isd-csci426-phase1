import { test, expect } from "@playwright/test";
test("assessment editor supports add, edit, remove and validates total weights", async ({
  page,
}) => {
  await page.goto("/admin/assessments");
  await expect(
    page.getByRole("heading", { name: "Courses & degree plans", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add assessment", exact: true })
    .click();
  await page.getByLabel("Assessment 1 name", { exact: true }).fill("Test 1");
  await page.getByLabel("Assessment 1 weight", { exact: true }).fill("40");
  await page
    .getByRole("button", { name: "Add assessment", exact: true })
    .click();
  await page.getByLabel("Assessment 2 name", { exact: true }).fill("Final");
  await page.getByLabel("Assessment 2 weight", { exact: true }).fill("60");
  await expect(page.locator(".weight-valid")).toContainText("100%");
  await page.getByLabel("Assessment 2 weight", { exact: true }).fill("50");
  await expect(
    page.getByText("Assessment weights must total 100%.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove assessment 2", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove assessment", exact: true })
    .click();
  await expect(
    page.getByLabel("Assessment 2 name", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Save assessment structure" }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByLabel("Assessment 1 name", { exact: true }),
  ).toHaveCount(0);
});
test("gradebook stays empty without registrations and has no publish bypass", async ({
  page,
}) => {
  await page.goto("/admin/gradebook");
  await expect(page.getByLabel("Gradebook semester")).toBeDisabled();
  await expect(page.getByLabel("Gradebook course")).toBeDisabled();
  await expect(page.getByLabel("Gradebook section")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Save draft", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByLabel("Grade assessment")).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Publish selected assessment",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator('input[type="number"]:visible')).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Publish all eligible final grades",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});

test("grading rules are validated and never claim an offline save", async ({
  page,
}) => {
  await page.goto("/admin/assessments");
  await page.getByRole("button", { name: "Add grade band" }).click();
  await page.getByLabel("Grade band 1 minimum", { exact: true }).fill("0");
  await page.getByLabel("Grade band 1 letter", { exact: true }).fill("F");
  await page.getByLabel("Grade band 1 points", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Save grading rules" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Nothing has been saved or sent",
  );
  await expect(
    page.getByText("Grading rules saved.", { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByLabel("Grade band 1 minimum", { exact: true }),
  ).toHaveCount(0);
});

test("academic courses and semester plans are local, searchable and responsive", async ({
  page,
}) => {
  await page.goto(
    "/courses?program=engineering-computer-engineering&q=CSCI250",
  );
  await expect(page.locator(".course-description-card")).toHaveCount(2);
  await expect(page.locator(".course-description-card").first()).toContainText(
    "Java",
  );
  await page.goto("/programs/engineering-computer-engineering");
  await expect(page.locator(".curriculum-term")).toHaveCount(7);
  await page.locator(".curriculum-term summary").first().click();
  await expect(page.locator(".curriculum-term").first()).toContainText(
    "MATH225",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
