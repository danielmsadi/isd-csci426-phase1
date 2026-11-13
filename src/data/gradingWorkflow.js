import {
  calculateResult,
  isPublished,
  numeric,
  sectionRoster,
  validateAssessments,
} from "./grading.js";

export function assessmentLock(db, courseId) {
  if (!courseId) return null;
  const structures = db.assessmentStructures.filter(
    (s) => s.courseId === courseId,
  );
  if (structures.length > 1)
    return "Multiple assessment structures exist for this course. Resolve the conflict before grading.";
  if (
    structures[0]?.inUse ||
    structures[0]?.locked ||
    db.grades.some(
      (g) =>
        g.courseId === courseId ||
        db.sections.some(
          (s) => s.id === g.sectionId && s.courseId === courseId,
        ),
    )
  )
    return "This course structure is already used for grading. Names, weights, maxima and assessment membership are locked across all sections.";
  return null;
}
export const scoreMissing = (score) =>
  score == null || String(score).trim() === "";
export const scoreValid = (score, assessment) =>
  !scoreMissing(score) &&
  numeric(score) &&
  Number(score) >= 0 &&
  Number(score) <= Number(assessment.maximum);
export const resultStatus = (record) =>
  isPublished(record || {})
    ? "Published"
    : !record || String(record.status).toLowerCase() === "unpublished"
      ? "Unpublished"
      : "Draft";

export function gradeWorkspace(db, scope, edits = {}) {
  const { semesterId, courseId, sectionId } = scope;
  const structures = db.assessmentStructures.filter(
    (s) => s.courseId === courseId,
  );
  const structure = structures.length === 1 ? structures[0] : null;
  const assessments = structure?.assessments || [];
  const structureError =
    structures.length > 1
      ? "Resolve duplicate course assessment structures before grading."
      : validateAssessments(assessments);
  const rows = sectionRoster(db, semesterId, courseId, sectionId).map(
    (student) => {
      const matches = db.grades.filter(
        (g) =>
          g.studentId === student.id &&
          g.sectionId === sectionId &&
          g.semesterId === semesterId &&
          (!g.courseId || g.courseId === courseId),
      );
      const record = matches[0];
      const savedScores = Object.fromEntries(
        assessments.map((a) => [
          a.id,
          record?.assessments?.find((s) => s.assessmentId === a.id)?.score ??
            "",
        ]),
      );
      const scores = { ...savedScores, ...edits[student.id] };
      const changed = assessments.some(
        (a) =>
          scoreMissing(scores[a.id]) !== scoreMissing(savedScores[a.id]) ||
          (!scoreMissing(scores[a.id]) &&
            String(scores[a.id]) !== String(savedScores[a.id])),
      );
      const result = calculateResult(assessments, scores, db.gradingRules);
      const conflict =
        matches.length > 1 ? "Duplicate grade records require review." : null;
      const eligible =
        !!record &&
        !changed &&
        !conflict &&
        !structureError &&
        result.complete &&
        !result.error &&
        !isPublished(record);
      return {
        student,
        record,
        scores,
        changed,
        result,
        conflict,
        eligible,
        status: changed ? "Unsaved draft" : resultStatus(record),
      };
    },
  );
  return {
    scope,
    structure,
    assessments,
    structureError,
    rows,
    dirty: rows.some((r) => r.changed),
    gradingRulesVersion: db.gradingRules?.version ?? null,
    decimals:
      Number.isInteger(Number(db.gradingRules?.decimals)) &&
      Number(db.gradingRules.decimals) >= 0 &&
      Number(db.gradingRules.decimals) <= 4
        ? Number(db.gradingRules.decimals)
        : 2,
  };
}

// Publication is metadata-only: scores are saved once through Gradebook first.
export function publicationPayload(workspace, action, role) {
  if (role !== "admin")
    throw new Error("Only Admin can manage grade publication.");
  if (!workspace.scope.sectionId || workspace.structureError)
    throw new Error(workspace.structureError || "Select a section.");
  if (workspace.dirty)
    throw new Error("Save Gradebook drafts before publishing results.");
  const targets = [...new Set(action.studentIds || [])];
  if (!targets.length)
    throw new Error("No eligible students are available for publication.");
  const assessment = workspace.assessments.find(
    (a) => a.id === action.assessmentId,
  );
  if (
    !["assessment", "final"].includes(action.type) ||
    (action.type === "assessment" && !assessment)
  )
    throw new Error("Choose a valid publication type and assessment.");
  const rows = targets.map((id) => {
    const row = workspace.rows.find((r) => r.student.id === id);
    if (!row?.record || row.conflict)
      throw new Error(
        "Publication targets must have one saved grade record in this section.",
      );
    if (action.type === "final" && !row.eligible)
      throw new Error("Final grades must be complete, valid and unpublished.");
    if (
      action.type === "assessment" &&
      (!scoreValid(row.scores[assessment.id], assessment) ||
        isPublished(
          row.record.assessments?.find(
            (a) => a.assessmentId === assessment.id,
          ) || {},
        ))
    )
      throw new Error(
        "Only valid, saved and unpublished assessment scores can be published.",
      );
    return { studentId: id, version: row.record.version ?? null };
  });
  return {
    ...workspace.scope,
    type: action.type,
    ...(assessment ? { assessmentId: assessment.id } : {}),
    structureVersion: workspace.structure.version ?? null,
    gradingRulesVersion: workspace.gradingRulesVersion,
    published: true,
    rows,
  };
}

export function draftPayload(workspace, role) {
  if (role !== "admin") throw new Error("Only Admin can edit grades.");
  if (workspace.structureError) throw new Error(workspace.structureError);
  const changed = workspace.rows.filter((row) => row.changed);
  if (!changed.length) throw new Error("No score changes to save.");
  return {
    ...workspace.scope,
    structureVersion: workspace.structure.version ?? null,
    gradingRulesVersion: workspace.gradingRulesVersion,
    published: false,
    assessmentPublication: "preserve-unchanged",
    rows: changed.map((row) => {
      if (row.conflict) throw new Error(row.conflict);
      if (
        workspace.assessments.some(
          (a) =>
            !scoreMissing(row.scores[a.id]) && !scoreValid(row.scores[a.id], a),
        )
      )
        throw new Error(
          `${row.student.name}: correct scores outside their allowed range.`,
        );
      return {
        studentId: row.student.id,
        version: row.record?.version ?? null,
        assessments: workspace.assessments.map((a) => ({
          assessmentId: a.id,
          score: scoreMissing(row.scores[a.id])
            ? null
            : Number(row.scores[a.id]),
        })),
      };
    }),
  };
}
