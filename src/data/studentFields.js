// Shared field metadata; official values live only on the existing student record.
export const studentGroups = [
  "Personal Information",
  "Contact Information",
  "Academic Information",
];
export function studentFields(db) {
  const options = (rows) =>
    rows.map((row) => ({ value: row.id, label: row.name }));
  const schools = [
    ...new Map(
      db.majors
        .filter((m) => m.schoolId || m.school)
        .map((m) => [
          m.schoolId || m.school,
          {
            value: m.schoolId || m.school,
            label: m.schoolName || m.school || m.schoolId,
          },
        ]),
    ).values(),
  ];
  const phone = { type: "tel", pattern: "[+0-9 ()-]{7,25}" };
  return [
    { name: "name", label: "Full name", minLength: 2, group: studentGroups[0] },
    {
      name: "dateOfBirth",
      label: "Date of birth",
      type: "date",
      max: new Date().toISOString().slice(0, 10),
      group: studentGroups[0],
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Female", "Male", "Other", "Prefer not to say"],
      group: studentGroups[0],
    },
    { name: "nationality", label: "Nationality", group: studentGroups[0] },
    {
      name: "personalEmail",
      label: "Personal email",
      type: "email",
      group: studentGroups[1],
    },
    {
      name: "email",
      label: "University email",
      type: "email",
      group: studentGroups[1],
    },
    { name: "phone", label: "Phone", ...phone, group: studentGroups[1] },
    {
      name: "address",
      label: "Full address",
      type: "textarea",
      group: studentGroups[1],
    },
    {
      name: "emergencyContactName",
      label: "Emergency contact name",
      group: studentGroups[1],
    },
    {
      name: "emergencyContactPhone",
      label: "Emergency contact phone",
      ...phone,
      group: studentGroups[1],
    },
    {
      name: "id",
      label: "Student ID",
      readOnly: true,
      required: false,
      placeholder: "Assigned automatically when the account is created",
      group: studentGroups[2],
    },
    {
      name: "schoolId",
      label: "School",
      type: "select",
      options: schools,
      group: studentGroups[2],
    },
    {
      name: "majorId",
      label: "Major",
      type: "select",
      options: options(db.majors),
      group: studentGroups[2],
    },
    {
      name: "enrollmentSemesterId",
      label: "Enrollment semester",
      type: "select",
      options: options(db.semesters),
      group: studentGroups[2],
    },
    {
      name: "admissionDate",
      label: "Admission date",
      type: "date",
      group: studentGroups[2],
    },
    {
      name: "status",
      label: "Academic status",
      type: "select",
      options: [
        "Pending setup",
        "Active",
        "Suspended",
        "Withdrawn",
        "Graduated",
      ],
      group: studentGroups[2],
    },
  ];
}
export function validateStudent(values, db) {
  if (values.dateOfBirth >= values.admissionDate)
    return "Admission date must follow the date of birth.";
  const major = db.majors.find((m) => m.id === values.majorId);
  if (!major || (major.schoolId || major.school) !== values.schoolId)
    return "Select a major belonging to the selected school.";
  return null;
}
export function studentFieldValue(field, student, db) {
  if (field.name === "majorId")
    return (
      db.majors.find((m) => m.id === student.majorId)?.name ||
      student.majorName ||
      student.majorId
    );
  if (field.name === "schoolId")
    return (
      student.schoolName ||
      field.options?.find((o) => o.value === student.schoolId)?.label ||
      student.schoolId
    );
  if (field.name === "enrollmentSemesterId")
    return (
      db.semesters.find((s) => s.id === student.enrollmentSemesterId)?.name ||
      student.enrollmentSemesterName ||
      student.enrollmentSemesterId
    );
  return student[field.name];
}
