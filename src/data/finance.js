// Read-only presentation of server records. Never fabricate invoices or mutate balances.
const amountAvailable = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "" &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0;

export function searchFinanceStudents(students, query) {
  const term = query.trim().toLocaleLowerCase();
  return students.filter((student) =>
    `${student.name || ""} ${student.id || ""}`
      .toLocaleLowerCase()
      .includes(term),
  );
}

export function selectedStudentFinance(
  db,
  studentId,
  today = new Date().toISOString().slice(0, 10),
) {
  const student = studentId
    ? db.students.find((s) => s.id === studentId)
    : null;
  if (!student)
    return {
      student: null,
      finance: null,
      installments: [],
      payments: [],
      overdueBalance: null,
      restrictionsKnown: false,
    };
  const nested = student.finance;
  const finance =
    nested && (!nested.studentId || nested.studentId === student.id)
      ? nested
      : db.finance?.studentId === student.id
        ? db.finance
        : null;
  const installments = db.installments.filter(
    (i) => i.studentId === student.id,
  );
  const payments = db.payments.filter((p) => p.studentId === student.id);
  let overdueBalance = amountAvailable(finance?.overdueBalance)
    ? Number(finance.overdueBalance)
    : null;
  if (
    overdueBalance === null &&
    installments.length &&
    installments.every((i) => /^\d{4}-\d{2}-\d{2}$/.test(i.dueDate || ""))
  ) {
    const overdue = installments.filter((i) => i.dueDate < today);
    if (
      overdue.every(
        (i) => amountAvailable(i.balance) && amountAvailable(i.penaltyBalance),
      )
    ) {
      overdueBalance = overdue.reduce(
        (sum, i) => sum + Number(i.balance) + Number(i.penaltyBalance),
        0,
      );
      overdueBalance = Math.round(overdueBalance * 100) / 100;
    }
  }
  return {
    student,
    finance,
    installments,
    payments,
    overdueBalance,
    restrictionsKnown:
      typeof finance?.hold === "boolean" || overdueBalance !== null,
  };
}

export function registrationOverridePayload(student, values) {
  if (!student?.id)
    throw new Error(
      "Select a student before changing registration restrictions.",
    );
  if (!["true", "false"].includes(values.registrationOverride))
    throw new Error("Choose a registration restriction decision.");
  const reason = String(values.reason || "").trim();
  if (reason.length < 10)
    throw new Error(
      "Enter a reason of at least 10 characters explaining this student's override decision.",
    );
  // Explicit allowlist: never include a bulk target, aid changes or academic-record release.
  return {
    studentId: student.id,
    registrationOverride: values.registrationOverride === "true",
    reason,
  };
}

export function financialAccess(
  finance,
  installments = [],
  today = new Date().toISOString().slice(0, 10),
) {
  const overdue = installments.some(
    (item) =>
      item.dueDate &&
      item.dueDate < today &&
      (Number(item.balance) > 0 || Number(item.penaltyBalance) > 0),
  );
  const restricted =
    finance?.hold === true || Number(finance?.overdueBalance) > 0 || overdue;
  return {
    restricted,
    registrationRestricted:
      restricted && finance?.registrationOverride !== true,
  };
}
export function validateCashPayment(values, studentId, installments) {
  if (!studentId) return "Select a student before recording a payment.";
  const installment = installments.find(
    (i) => i.id === values.installmentId && i.studentId === studentId,
  );
  if (!installment)
    return "Choose an installment belonging to the selected student.";
  if (!(Number(values.amount) > 0))
    return "Payment amount must be greater than zero.";
  if (
    installment.balance != null &&
    Number(values.amount) >
      Number(installment.balance) + Number(installment.penaltyBalance || 0)
  )
    return "Payment cannot exceed the outstanding installment balance and fees.";
  return null;
}

// Semester ownership is mandatory; records with unknown semesters are not assignable.
export function studentSemesterFinance(db, studentId, semesterId) {
  const account = selectedStudentFinance(db, studentId);
  const valid =
    account.student && db.semesters.some((s) => s.id === semesterId);
  return {
    finance:
      valid && account.finance?.semesterId === semesterId
        ? account.finance
        : null,
    installments: valid
      ? account.installments.filter(
          (i) =>
            i.semesterId === semesterId &&
            Number(i.number) >= 1 &&
            Number(i.number) <= 4,
        )
      : [],
    payments: valid
      ? account.payments.filter((p) => p.semesterId === semesterId)
      : [],
    requests: valid
      ? db.requests.filter(
          (r) =>
            r.type === "Aid" &&
            r.studentId === studentId &&
            r.semesterId === semesterId,
        )
      : [],
  };
}

export function validateOfficePayment(
  values,
  studentId,
  semesterId,
  installments,
) {
  if (!semesterId) return "Select a semester.";
  const error = validateCashPayment(
    values,
    studentId,
    installments.filter((i) => i.semesterId === semesterId),
  );
  if (error) return error;
  if (!Number.isFinite(Number(values.amount)))
    return "Enter a valid payment amount.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.date || "") ||
    !Number.isFinite(Date.parse(values.date)) ||
    new Date(values.date).toISOString().slice(0, 10) !== values.date
  )
    return "Enter a valid payment date.";
  if (!String(values.reference || "").trim()) return "Enter a receipt number.";
  return null;
}

export function aidDecisionPayload(request, studentId, semesterId, values) {
  if (
    !studentId ||
    !semesterId ||
    !request?.id ||
    request.type !== "Aid" ||
    request.studentId !== studentId ||
    request.semesterId !== semesterId
  )
    throw new Error("Select an aid request for this student and semester.");
  if (!["Approved", "Rejected"].includes(values.status))
    throw new Error("Choose approve or reject.");
  const percent = values.aidPercent;
  if (
    values.status === "Approved" &&
    (percent == null ||
      String(percent).trim() === "" ||
      !Number.isFinite(Number(percent)) ||
      Number(percent) < 0 ||
      Number(percent) > 100)
  )
    throw new Error("Enter an approved discount from 0 to 100%.");
  if (!String(values.decisionNote || "").trim())
    throw new Error("Enter a decision note.");
  return {
    studentId,
    semesterId,
    status: values.status,
    aidPercent: values.status === "Approved" ? Number(percent) : 0,
    decisionNote: values.decisionNote.trim(),
  };
}
