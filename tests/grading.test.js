import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAssessments,
  validateRules,
  calculateResult,
  publishedGrades,
  sectionRoster,
} from "../src/data/grading.js";
// Arithmetic fixtures only; never imported by the application or persisted.
const structure = [
  { id: "a", name: "First assessment", weight: 40, maximum: 50 },
  { id: "b", name: "Second assessment", weight: 60, maximum: 100 },
];
const rules = {
  bands: [
    { minimum: 90, letter: "A", points: 4 },
    { minimum: 70, letter: "C", points: 2 },
    { minimum: 0, letter: "F", points: 0 },
  ],
  decimals: 2,
  roundBeforeGrading: false,
};
test("assessment weights require unique names, positive maxima and exactly 100 percent", () => {
  assert.equal(validateAssessments(structure), null);
  assert.match(validateAssessments([]), /Add/);
  assert.match(
    validateAssessments([{ ...structure[0], weight: 20 }, structure[1]]),
    /100/,
  );
  assert.match(
    validateAssessments([{ ...structure[0], maximum: 0 }, structure[1]]),
    /maximum/,
  );
  assert.match(
    validateAssessments([
      structure[0],
      { ...structure[1], name: structure[0].name },
    ]),
    /unique/,
  );
  assert.match(
    validateAssessments([structure[0], { ...structure[1], weight: " " }]),
    /weight/,
  );
});
test("weighted calculation normalizes each raw score by its own maximum", () => {
  const result = calculateResult(structure, { a: 25, b: 100 }, rules);
  assert.equal(result.percentage, 80);
  assert.equal(result.letter, "C");
  assert.equal(result.gpa, 2);
});
test("missing scores stay incomplete and explicit zero is valid", () => {
  assert.equal(
    calculateResult(structure, { a: "", b: 100 }, rules).complete,
    false,
  );
  assert.equal(calculateResult(structure, { a: 0, b: 0 }, rules).percentage, 0);
  assert.match(
    calculateResult(structure, { a: 51, b: 100 }, rules).error,
    /between/,
  );
  assert.match(
    calculateResult(structure, { a: -1, b: 100 }, rules).error,
    /between/,
  );
});
test("grade boundaries and optional rounding use configured rules", () => {
  const single = [{ id: "a", name: "Assessment", weight: 100, maximum: 100 }];
  assert.equal(calculateResult(single, { a: 90 }, rules).letter, "A");
  assert.equal(calculateResult(single, { a: 89.999 }, rules).letter, "C");
  assert.equal(
    calculateResult(
      single,
      { a: 89.999 },
      { ...rules, roundBeforeGrading: true },
    ).letter,
    "A",
  );
  assert.match(
    validateRules({ ...rules, bands: rules.bands.slice(0, 2) }),
    /zero|0/,
  );
  assert.match(
    validateRules({
      ...rules,
      bands: [...rules.bands, { minimum: 70, letter: "B", points: 3 }],
    }),
    /unique/,
  );
  assert.match(validateRules({ ...rules, decimals: 1.5 }), /integer/);
});
test("no rules means no manufactured letter grade or GPA", () => {
  const result = calculateResult(structure, { a: 50, b: 100 }, null);
  assert.equal(result.percentage, 100);
  assert.equal(result.letter, undefined);
  assert.equal(result.gpa, undefined);
});
test("student publication filtering fails closed on holds and excludes drafts", () => {
  const grades = [
    { id: "published", published: true, studentId: "self" },
    { id: "draft", published: false, studentId: "self" },
    { id: "other", published: true, studentId: "other" },
    { id: "inconsistent", published: true, status: "Draft", studentId: "self" },
  ];
  const db = { grades, currentStudent: { id: "self" }, finance: null };
  assert.deepEqual(
    publishedGrades(db).map((g) => g.id),
    ["published"],
  );
  assert.deepEqual(publishedGrades({ ...db, finance: { hold: true } }), []);
});
test("roster is scoped to actual matching enrollments, semester and section", () => {
  const db = {
    sections: [{ id: "s", courseId: "c", semesterId: "t" }],
    students: [{ id: "active" }, { id: "dropped" }, { id: "other" }],
    enrollments: [
      { studentId: "active", sectionId: "s", semesterId: "t" },
      { studentId: "active", sectionId: "s", semesterId: "t" },
      {
        studentId: "dropped",
        sectionId: "s",
        semesterId: "t",
        status: "Dropped",
      },
      { studentId: "other", sectionId: "s", semesterId: "previous" },
    ],
  };
  assert.deepEqual(
    sectionRoster(db, "t", "c", "s").map((s) => s.id),
    ["active"],
  );
  assert.deepEqual(sectionRoster(db, "t", "wrong", "s"), []);
  assert.deepEqual(sectionRoster(db, "", "c", "s"), []);
});
