export function validateSemester(values) {
  if (values.registrationEnd <= values.registrationStart)
    return "Registration must close after it opens.";
  if (values.dropDeadline < values.registrationStart)
    return "The drop deadline must follow registration opening.";
  if (Number(values.minCredits) > Number(values.maxCredits))
    return "Minimum credits cannot exceed the maximum.";
  if (
    [2, 3, 4].some(
      (i) => values[`installment${i}`] <= values[`installment${i - 1}`],
    )
  )
    return "Installment due dates must be in ascending order.";
  return null;
}
export const semesterFields = [
  { name: "semester", label: "Semester name", group: "Semester Management" },
  { name: "nextSemester", label: "Next semester", required: false },
  {
    name: "registrationStart",
    label: "Registration opens",
    type: "date",
    group: "Registration & credit rules",
  },
  { name: "registrationEnd", label: "Registration closes", type: "date" },
  { name: "dropDeadline", label: "Drop & full-refund deadline", type: "date" },
  {
    name: "minCredits",
    label: "Minimum credits",
    type: "number",
    min: 0,
    step: 1,
  },
  {
    name: "maxCredits",
    label: "Maximum credits",
    type: "number",
    min: 1,
    step: 1,
  },
  ...[1, 2, 3, 4].map((i) => ({
    name: `installment${i}`,
    label: `Installment ${i} due date`,
    type: "date",
    ...(i === 1 ? { group: "Four installment due dates" } : {}),
  })),
];
export function semesterEvents(semester) {
  if (!semester) return [];
  return semesterFields
    .filter(
      (field) =>
        field.type === "date" &&
        /^\d{4}-\d{2}-\d{2}$/.test(semester[field.name] || ""),
    )
    .map((field) => ({
      id: field.name,
      label: field.label,
      date: semester[field.name],
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
