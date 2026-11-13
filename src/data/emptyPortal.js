// Data shape only: no sample records or invented totals.
export function createEmptyPortal() {
  return {
    currentStudent: null,
    settings: null,
    summary: null,
    finance: null,
    students: [],
    majors: [],
    courses: [],
    sections: [],
    enrollments: [],
    grades: [],
    semesters: [],
    assessmentStructures: [],
    gradingRules: null,
    degreePlans: [],
    degreeRequirements: [],
    installments: [],
    payments: [],
    pricing: [],
    requests: [],
    announcements: [],
  };
}
export function normalizePortal(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    throw new Error("Invalid portal response.");
  const empty = createEmptyPortal();
  for (const key of Object.keys(empty)) {
    if (Array.isArray(empty[key])) {
      if (payload[key] !== undefined && !Array.isArray(payload[key]))
        throw new Error(`Invalid ${key} response.`);
      empty[key] = payload[key] ?? [];
    } else empty[key] = payload[key] ?? null;
  }
  // Reuse the directory record when both views refer to the same account.
  // No separate editable student-profile state is maintained.
  if (empty.currentStudent?.id) {
    empty.currentStudent =
      empty.students.find(
        (student) => student.id === empty.currentStudent.id,
      ) || empty.currentStudent;
  }
  return empty;
}
