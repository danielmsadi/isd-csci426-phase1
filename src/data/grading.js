import { financialAccess } from "./finance.js";
// Pure frontend calculations. Persisted results must be recomputed and authorized by the server.
export const numeric = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "" &&
  Number.isFinite(Number(value));
export function validateAssessments(items) {
  if (!items.length) return "Add at least one assessment.";
  const names = new Set(),
    ids = new Set();
  for (const item of items) {
    if (!item.id || ids.has(item.id))
      return "Assessment identifiers must be unique.";
    ids.add(item.id);
    const name = item.name?.trim().toLowerCase();
    if (!name || names.has(name))
      return "Assessment names must be nonempty and unique.";
    names.add(name);
    if (
      !numeric(item.weight) ||
      Number(item.weight) <= 0 ||
      Number(item.weight) > 100
    )
      return "Each weight must be greater than 0 and at most 100.";
    if (!numeric(item.maximum) || Number(item.maximum) <= 0)
      return "Each maximum score must be greater than 0.";
  }
  if (
    Math.abs(items.reduce((sum, a) => sum + Number(a.weight), 0) - 100) >
    0.000001
  )
    return "Assessment weights must total 100%.";
  return null;
}
export function validateRules(rules) {
  if (!rules?.bands?.length)
    return "Configure a grading scale before calculating letter grades and GPA.";
  const thresholds = new Set(),
    letters = new Set();
  for (const band of rules.bands) {
    if (
      !numeric(band.minimum) ||
      Number(band.minimum) < 0 ||
      Number(band.minimum) > 100 ||
      thresholds.has(Number(band.minimum))
    )
      return "Grade thresholds must be unique numbers between 0 and 100.";
    thresholds.add(Number(band.minimum));
    if (!band.letter?.trim() || letters.has(band.letter.trim().toUpperCase()))
      return "Grade labels must be nonempty and unique.";
    letters.add(band.letter.trim().toUpperCase());
    if (
      !numeric(band.points) ||
      Number(band.points) < 0 ||
      Number(band.points) > 4
    )
      return "Grade points must be between 0 and 4.";
  }
  if (!thresholds.has(0))
    return "Include a threshold of 0 so every percentage is covered.";
  if (
    !Number.isInteger(Number(rules.decimals)) ||
    Number(rules.decimals) < 0 ||
    Number(rules.decimals) > 4
  )
    return "Decimal precision must be an integer from 0 to 4.";
  const sorted = [...rules.bands].sort(
    (a, b) => Number(a.minimum) - Number(b.minimum),
  );
  if (
    sorted.some((b, i) => i && Number(b.points) < Number(sorted[i - 1].points))
  )
    return "Grade points cannot decrease as thresholds increase.";
  return null;
}
export function calculateResult(assessments, scores, rules) {
  const structureError = validateAssessments(assessments);
  if (structureError) return { error: structureError, complete: false };
  let total = 0,
    missing = 0;
  for (const a of assessments) {
    const score = scores?.[a.id];
    if (score === "" || score === null || score === undefined) {
      missing++;
      continue;
    }
    if (
      !numeric(score) ||
      Number(score) < 0 ||
      Number(score) > Number(a.maximum)
    )
      return {
        error: `${a.name}: enter a score between 0 and ${a.maximum}.`,
        complete: false,
      };
    total += (Number(score) / Number(a.maximum)) * Number(a.weight);
  }
  if (missing) return { complete: false, missing, error: null };
  const ruleError = validateRules(rules);
  if (ruleError) return { complete: true, percentage: total, error: ruleError };
  const rounded = Number(total.toFixed(Number(rules.decimals)));
  const comparison = rules.roundBeforeGrading ? rounded : total;
  const band = [...rules.bands]
    .sort((a, b) => Number(b.minimum) - Number(a.minimum))
    .find((b) => comparison >= Number(b.minimum));
  return {
    complete: true,
    percentage: total,
    displayedPercentage: rounded,
    letter: band.letter,
    gpa: Number(band.points),
    error: null,
  };
}
export const isPublished = (grade) =>
  grade.published === true &&
  !["draft", "unpublished"].includes(String(grade.status || "").toLowerCase());
const courseIdentity = (g) => ({
  id: g.id,
  studentId: g.studentId,
  courseId: g.courseId,
  sectionId: g.sectionId,
  courseCode: g.courseCode,
  courseName: g.courseName,
  semesterId: g.semesterId,
  semester: g.semester,
  credits: g.credits,
});
const visibleAssessments = (g) =>
  (g.assessments || [])
    .filter((a) => isPublished(a) && numeric(a.score) && Number(a.score) >= 0)
    .map((a) => ({
      assessmentId: a.assessmentId,
      name: a.name,
      weight: a.weight,
      score: a.score,
      maximum: a.maximum,
      published: true,
      status: "Published",
    }));
function studentGradeRecords(db) {
  if (
    !db.currentStudent?.id ||
    financialAccess(db.finance, db.installments).restricted
  )
    return [];
  return db.grades.filter((g) => g.studentId === db.currentStudent.id);
}
export function publishedGrades(db) {
  return studentGradeRecords(db)
    .filter(isPublished)
    .map((g) => ({
      ...courseIdentity(g),
      grade: g.grade,
      total: g.total,
      gpa: g.gpa,
      published: true,
      status: "Published",
      assessments: visibleAssessments(g),
    }));
}
export function publishedAssessmentCourses(db) {
  return studentGradeRecords(db)
    .map((g) => ({ ...courseIdentity(g), assessments: visibleAssessments(g) }))
    .filter((g) => g.assessments.length);
}
export function sectionRoster(db, semesterId, courseId, sectionId) {
  if (!semesterId || !courseId || !sectionId) return [];
  const section = db.sections.find(
    (s) =>
      s.id === sectionId &&
      s.courseId === courseId &&
      s.semesterId === semesterId,
  );
  if (!section) return [];
  const enrolled = new Set(
    db.enrollments
      .filter(
        (e) =>
          e.sectionId === sectionId &&
          e.semesterId === semesterId &&
          !["Dropped", "Cancelled", "Withdrawn"].includes(e.status),
      )
      .map((e) => e.studentId),
  );
  return db.students.filter((s) => enrolled.has(s.id));
}

export function semesterGradePointAverage(grades) {
  if (
    !grades.length ||
    grades.some(
      (g) =>
        !isPublished(g) ||
        !numeric(g.credits) ||
        Number(g.credits) <= 0 ||
        !numeric(g.gpa) ||
        Number(g.gpa) < 0 ||
        Number(g.gpa) > 4,
    )
  )
    return null;
  return (
    grades.reduce((sum, g) => sum + Number(g.credits) * Number(g.gpa), 0) /
    grades.reduce((sum, g) => sum + Number(g.credits), 0)
  );
}
