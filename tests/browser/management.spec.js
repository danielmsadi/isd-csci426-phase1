import { test, expect } from "@playwright/test";
test("student creation has grouped official fields and profile is read-only", async ({
  page,
}) => {
  await page.goto("/admin/students");
  await page
    .getByRole("button", { name: "Create student account", exact: true })
    .click();
  for (const group of [
    "Personal Information",
    "Contact Information",
    "Academic Information",
  ])
    await expect(
      page.getByRole("heading", { name: group, exact: true }),
    ).toBeVisible();
  for (const label of [
    "Full name",
    "Date of birth",
    "Gender",
    "Nationality",
    "Personal email",
    "University email",
    "Phone",
    "Full address",
    "Emergency contact name",
    "Emergency contact phone",
    "Student ID",
    "School",
    "Major",
    "Enrollment semester",
    "Admission date",
    "Academic status",
  ])
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  await expect(page.getByLabel("Student ID", { exact: true })).toHaveAttribute(
    "readonly",
    "",
  );
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeDisabled();
  await page.goto("/student/profile");
  await expect(
    page.locator("main form, main input, main textarea"),
  ).toHaveCount(0);
  await expect(page.getByText(/No student profile is connected/)).toBeVisible();
});
test("legacy grade routes open one entry interface and course configuration", async ({
  page,
}) => {
  for (const path of ["grades", "gradebook"]) {
    await page.goto(`/admin/${path}`);
    await expect(page).toHaveURL(/grade-management$/);
    await expect(page.getByRole("tab")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Save draft", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "Publish selected assessment",
        exact: true,
      }),
    ).toBeDisabled();
  }
  await page
    .getByRole("link", { name: "Configure course assessments", exact: true })
    .click();
  await expect(page).toHaveURL(/courses\?view=assessments$/);
  await expect(
    page.getByRole("button", { name: "Add assessment", exact: true }),
  ).toBeVisible();
  await page.goto("/admin/assessments");
  await expect(page).toHaveURL(/courses\?view=assessments$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/grade-management");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("academic calendar validates deadlines and never saves offline", async ({
  page,
}) => {
  await page.goto("/admin/settings");
  for (const [label, value] of [
    ["Semester name", "Presentation semester"],
    ["Registration opens", "2026-01-01"],
    ["Registration closes", "2026-01-10"],
    ["Drop & full-refund deadline", "2026-01-15"],
    ["Minimum credits", "9"],
    ["Maximum credits", "18"],
    ["Installment 1 due date", "2026-02-01"],
    ["Installment 2 due date", "2026-03-01"],
    ["Installment 3 due date", "2026-04-01"],
    ["Installment 4 due date", "2026-03-01"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "Create semester", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("ascending order");
  await page
    .getByLabel("Installment 4 due date", { exact: true })
    .fill("2026-05-01");
  await page
    .getByRole("button", { name: "Create semester", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Nothing has been saved or sent",
  );
  await page
    .getByRole("tab", { name: "Calendar Overview", exact: true })
    .click();
  await expect(page.getByText(/No academic dates are available/)).toBeVisible();
});
test("finance has exactly three forms, one student selector and safe empty states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/finance?tab=holds");
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.locator("main form")).toHaveCount(3);
  for (const name of [
    "Course Credit Pricing",
    "Record Cash Payment",
    "Financial Aid",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(page.getByLabel("Finance student")).toHaveCount(1);
  await expect(page.getByLabel("Finance student")).toBeDisabled();
  await expect(page.getByLabel("Finance semester")).toBeDisabled();
  for (const name of [
    "Save credit price",
    "Record payment",
    "Record aid decision",
  ])
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Manage registration override",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByLabel("Search by name or Student ID", { exact: true })
    .fill("No matching account");
  await expect(page.getByRole("status")).toContainText(
    "No students match your search.",
  );
  await expect(page.getByLabel("Payment date", { exact: true })).toBeVisible();
  await expect(
    page.getByLabel("Receipt number", { exact: true }),
  ).toBeVisible();
  await page
    .getByText("Installments & payment history", { exact: true })
    .click();
  await expect(page.locator("tbody tr:visible")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/finance-mobile.png",
    fullPage: true,
  });
});

test("tuition separates degree levels and preserves known fees without implying unavailable means inapplicable", async ({
  page,
}) => {
  await page.goto("/tuition");
  await expect(
    page.getByRole("region", { name: "Undergraduate tuition" }),
  ).toContainText("$179");
  await expect(
    page.getByRole("region", { name: "Graduate tuition", exact: true }),
  ).toContainText("$225");
  await expect(
    page.getByRole("region", { name: "Graduate tuition", exact: true }),
  ).toContainText("Information unavailable");
  await expect(
    page.getByText(/Course tuition = registered credit hours/),
  ).toBeVisible();
  await expect(page.locator(".fee-list")).toContainText("LBP 500,000 + USD 10");
  await expect(page.locator(".project-policy-callout")).toContainText(
    "not LIU’s published tuition",
  );
});
