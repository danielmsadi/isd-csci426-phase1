import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyPortal } from "../src/data/emptyPortal.js";
import {
  assessmentLock,
  gradeWorkspace,
  draftPayload,
  publicationPayload,
} from "../src/data/gradingWorkflow.js";
import {
  publishedGrades,
  publishedAssessmentCourses,
} from "../src/data/grading.js";
// Isolated calculation/authorization fixtures; never seed the running portal.
const scope = { semesterId: "term", courseId: "course", sectionId: "section" };
function records() {
  return {
    ...createEmptyPortal(),
    currentStudent: { id: "one" },
    students: [
      { id: "one", name: "First record" },
      { id: "two", name: "Second record" },
    ],
    sections: [
      { id: "section", courseId: "course", semesterId: "term" },
      { id: "other-section", courseId: "course", semesterId: "term" },
    ],
    enrollments: [
      { studentId: "one", sectionId: "section", semesterId: "term" },
      { studentId: "two", sectionId: "section", semesterId: "term" },
    ],
    assessmentStructures: [
      {
        courseId: "course",
        version: 3,
        assessments: [
          { id: "test", name: "Test", weight: 40, maximum: 20 },
          { id: "final", name: "Final", weight: 60, maximum: 100 },
        ],
      },
    ],
    gradingRules: {
      version: 2,
      decimals: 1,
      roundBeforeGrading: false,
      bands: [
        { minimum: 80, letter: "A", points: 4 },
        { minimum: 0, letter: "F", points: 0 },
      ],
    },
    grades: [
      {
        id: "g-one",
        studentId: "one",
        courseId: "course",
        sectionId: "section",
        semesterId: "term",
        version: 1,
        published: false,
        status: "Draft",
        total: 95,
        gpa: 4,
        grade: "A",
        privateNote: "private",
        assessments: [
          {
            assessmentId: "test",
            name: "Test",
            score: 20,
            weight: 40,
            maximum: 20,
            published: true,
            status: "Published",
          },
          {
            assessmentId: "final",
            name: "Final",
            score: 90,
            weight: 60,
            maximum: 100,
            published: false,
          },
        ],
      },
      {
        id: "g-two",
        studentId: "two",
        courseId: "course",
        sectionId: "section",
        semesterId: "term",
        version: 2,
        published: false,
        status: "Unpublished",
        assessments: [
          { assessmentId: "test", score: 10 },
          { assessmentId: "final", score: null },
        ],
      },
    ],
  };
}
test("assessment release is independent of a complete final grade and limited to selected valid results", () => {
  const db = records(),
    w = gradeWorkspace(db, scope);
  const payload = publicationPayload(
    w,
    { type: "assessment", assessmentId: "test", studentIds: ["two"] },
    "admin",
  );
  assert.equal(payload.assessmentId, "test");
  assert.deepEqual(payload.rows, [{ studentId: "two", version: 2 }]);
  assert.equal(payload.rows[0].assessments, undefined); // Publication cannot change scores.
  assert.throws(
    () =>
      publicationPayload(
        w,
        { type: "assessment", assessmentId: "final", studentIds: ["two"] },
        "admin",
      ),
    /valid, saved/,
  );
  assert.throws(
    () =>
      publicationPayload(
        w,
        { type: "assessment", assessmentId: "test", studentIds: ["one"] },
        "admin",
      ),
    /unpublished/,
  );
});
test("final publication includes only eligible students; incomplete, wrong-section and non-admin targets fail", () => {
  const w = gradeWorkspace(records(), scope);
  assert.equal(w.rows[0].result.percentage, 94);
  assert.equal(w.rows[0].result.letter, "A");
  assert.equal(w.rows[1].result.complete, false);
  const eligible = w.rows.filter((r) => r.eligible).map((r) => r.student.id);
  assert.deepEqual(eligible, ["one"]);
  const action = { type: "final", studentIds: eligible };
  assert.deepEqual(publicationPayload(w, action, "admin").rows, [
    { studentId: "one", version: 1 },
  ]);
  assert.throws(
    () =>
      publicationPayload(w, { type: "final", studentIds: ["two"] }, "admin"),
    /complete/,
  );
  assert.throws(
    () =>
      publicationPayload(
        w,
        { type: "final", studentIds: ["outsider"] },
        "admin",
      ),
    /saved grade record/,
  );
  assert.throws(() => publicationPayload(w, action, "student"), /Only Admin/);
});
test("draft saves contain only edited rows, retain blanks as null and block unsaved publication", () => {
  const db = records(),
    original = structuredClone(db);
  const w = gradeWorkspace(db, scope, { one: { final: "" } });
  const payload = draftPayload(w, "admin");
  assert.equal(payload.rows.length, 1);
  assert.equal(payload.rows[0].studentId, "one");
  assert.equal(payload.rows[0].assessments[1].score, null);
  assert.equal(payload.assessmentPublication, "preserve-unchanged");
  assert.throws(
    () =>
      publicationPayload(w, { type: "final", studentIds: ["one"] }, "admin"),
    /Save Gradebook/,
  );
  assert.throws(() => draftPayload(w, "student"), /Only Admin/);
  assert.throws(
    () =>
      draftPayload(gradeWorkspace(db, scope, { one: { test: 21 } }), "admin"),
    /allowed range/,
  );
  assert.deepEqual(db, original);
});
test("course structure locks across all sections, server usage metadata and duplicate definitions", () => {
  const db = records();
  db.grades = [{ sectionId: "other-section" }];
  assert.match(assessmentLock(db, "course"), /already used/);
  db.grades = [];
  assert.equal(assessmentLock(db, "course"), null);
  db.assessmentStructures[0].inUse = true;
  assert.match(assessmentLock(db, "course"), /already used/);
  db.assessmentStructures.push({ ...db.assessmentStructures[0] });
  assert.match(assessmentLock(db, "course"), /Multiple/);
  assert.match(gradeWorkspace(db, scope).structureError, /duplicate/);
});
test("student projections expose only explicitly published assessments, never draft final values or hidden marks", () => {
  const db = records();
  assert.deepEqual(publishedGrades(db), []);
  const visible = publishedAssessmentCourses(db);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].assessments.length, 1);
  assert.equal(visible[0].assessments[0].score, 20);
  for (const key of ["total", "gpa", "grade", "privateNote"])
    assert.equal(visible[0][key], undefined);
  db.grades[0].published = true;
  db.grades[0].status = "Published";
  assert.equal(publishedGrades(db)[0].assessments.length, 1);
  db.grades[0].assessments[0].status = "Unpublished";
  assert.deepEqual(publishedAssessmentCourses(db), []);
  assert.equal(publishedGrades(db)[0].assessments.length, 0);
  db.finance = { hold: true, registrationOverride: true };
  assert.deepEqual(publishedGrades(db), []);
  assert.deepEqual(publishedAssessmentCourses(db), []);
  db.finance = null;
  db.currentStudent = null;
  assert.deepEqual(publishedGrades(db), []);
  assert.deepEqual(publishedAssessmentCourses(db), []);
});
