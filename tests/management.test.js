import test from "node:test";
import assert from "node:assert/strict";
import { financialAccess, validateCashPayment } from "../src/data/finance.js";
import { validateSemester, semesterEvents } from "../src/data/semester.js";
import {
  semesterGradePointAverage,
  publishedGrades,
} from "../src/data/grading.js";
import { studentFields, validateStudent } from "../src/data/studentFields.js";
test("settled overdue tuition and penalties release restrictions, overrides affect registration only", () => {
  const late = [{ dueDate: "2026-01-01", balance: 0, penaltyBalance: 20 }];
  assert.deepEqual(
    financialAccess({ registrationOverride: true }, late, "2026-02-01"),
    { restricted: true, registrationRestricted: false },
  );
  assert.deepEqual(
    financialAccess(null, [{ ...late[0], penaltyBalance: 0 }], "2026-02-01"),
    { restricted: false, registrationRestricted: false },
  );
  assert.equal(
    financialAccess({ hold: true }, [], "2026-02-01").restricted,
    true,
  );
  assert.equal(
    financialAccess(
      null,
      [{ dueDate: "2026-03-01", balance: 100 }],
      "2026-02-01",
    ).restricted,
    false,
  );
  assert.deepEqual(
    publishedGrades({
      finance: { registrationOverride: true },
      installments: late,
      grades: [{ published: true, status: "Published" }],
    }),
    [],
  );
});
test("cash validation rejects wrong account, nonpositive and excessive amounts", () => {
  const installments = [
    {
      id: "installment",
      studentId: "account",
      balance: 80,
      penaltyBalance: 20,
    },
  ];
  assert.equal(
    validateCashPayment(
      { installmentId: "installment", amount: 100 },
      "account",
      installments,
    ),
    null,
  );
  assert.match(
    validateCashPayment(
      { installmentId: "installment", amount: 1 },
      "another",
      installments,
    ),
    /belonging/,
  );
  assert.match(
    validateCashPayment(
      { installmentId: "installment", amount: 0 },
      "account",
      installments,
    ),
    /greater/,
  );
  assert.match(
    validateCashPayment(
      { installmentId: "installment", amount: 101 },
      "account",
      installments,
    ),
    /exceed/,
  );
});
test("semester dates and credit limits are ordered numerically", () => {
  const values = {
    registrationStart: "2026-01-01",
    registrationEnd: "2026-01-10",
    dropDeadline: "2026-01-15",
    minCredits: 9,
    maxCredits: 18,
    installment1: "2026-02-01",
    installment2: "2026-03-01",
    installment3: "2026-04-01",
    installment4: "2026-05-01",
  };
  assert.equal(validateSemester(values), null);
  assert.match(
    validateSemester({ ...values, registrationEnd: values.registrationStart }),
    /close after/,
  );
  assert.match(validateSemester({ ...values, minCredits: 20 }), /Minimum/);
  assert.match(
    validateSemester({ ...values, installment4: values.installment3 }),
    /ascending/,
  );
  assert.equal(semesterEvents(values).length, 7);
  assert.deepEqual(semesterEvents({}), []);
});
test("semester GPA is credit weighted and never includes incomplete or draft marks", () => {
  const grades = [
    { published: true, status: "Published", credits: 3, gpa: 4 },
    { published: true, status: "Published", credits: 1, gpa: 0 },
  ];
  assert.equal(semesterGradePointAverage(grades), 3);
  assert.equal(semesterGradePointAverage([]), null);
  assert.equal(
    semesterGradePointAverage([
      ...grades,
      { published: false, credits: 3, gpa: 4 },
    ]),
    null,
  );
  assert.equal(semesterGradePointAverage([{ ...grades[0], gpa: "" }]), null);
});
test("student form uses one field schema and checks major-school consistency", () => {
  const db = {
    majors: [
      { id: "major", name: "Major", schoolId: "school", schoolName: "School" },
    ],
    semesters: [],
  };
  const fields = studentFields(db);
  assert.equal(new Set(fields.map((f) => f.name)).size, fields.length);
  assert.equal(fields.find((f) => f.name === "id").readOnly, true);
  const values = {
    majorId: "major",
    schoolId: "school",
    dateOfBirth: "2000-01-01",
    admissionDate: "2026-01-01",
  };
  assert.equal(validateStudent(values, db), null);
  assert.match(
    validateStudent({ ...values, schoolId: "other" }, db),
    /belonging/,
  );
  assert.match(
    validateStudent({ ...values, admissionDate: "1999-01-01" }, db),
    /date of birth/,
  );
});
