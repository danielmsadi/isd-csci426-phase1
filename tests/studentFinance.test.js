import test from "node:test";
import assert from "node:assert/strict";
import {
  selectedStudentFinance,
  searchFinanceStudents,
  registrationOverridePayload,
  financialAccess,
} from "../src/data/finance.js";

// Isolated test inputs only; never imported into the application or persisted.
const accountData = () => ({
  students: [
    { id: "account-a", name: "First account", majorName: "Program A" },
    {
      id: "account-b",
      name: "Second account",
      finance: { hold: true, registrationOverride: true },
    },
  ],
  finance: { studentId: "account-b", overdueBalance: 900, hold: true },
  installments: [
    {
      studentId: "account-a",
      dueDate: "2026-01-01",
      balance: 80,
      penaltyBalance: 20,
    },
    {
      studentId: "account-b",
      dueDate: "2026-01-01",
      balance: 900,
      penaltyBalance: 20,
    },
  ],
  payments: [
    { studentId: "account-a", id: "receipt-a" },
    { studentId: "account-b", id: "receipt-b" },
  ],
});
test("finance selection scopes balances, receipts and restrictions to an existing selected student", () => {
  const db = accountData(),
    before = structuredClone(db);
  const a = selectedStudentFinance(db, "account-a", "2026-02-01");
  assert.equal(a.student, db.students[0]);
  assert.equal(a.finance, null); // Other account's global summary must not leak.
  assert.equal(a.overdueBalance, 100);
  assert.equal(a.installments.length, 1);
  assert.equal(a.payments[0].id, "receipt-a");
  assert.deepEqual(financialAccess(a.finance, a.installments, "2026-02-01"), {
    restricted: true,
    registrationRestricted: true,
  });
  const b = selectedStudentFinance(db, "account-b", "2026-02-01");
  assert.deepEqual(financialAccess(b.finance, b.installments, "2026-02-01"), {
    restricted: true,
    registrationRestricted: false,
  });
  assert.deepEqual(db, before);
});
test("no selection, removed students and mismatched finance ownership cannot expose account data", () => {
  const db = accountData();
  for (const id of ["", "not-found"]) {
    const result = selectedStudentFinance(db, id);
    assert.equal(result.student, null);
    assert.equal(result.finance, null);
    assert.deepEqual(result.installments, []);
    assert.deepEqual(result.payments, []);
    assert.equal(result.overdueBalance, null);
    assert.equal(result.restrictionsKnown, false);
  }
  db.students[0].finance = { studentId: "account-b", overdueBalance: 99999 };
  assert.equal(
    selectedStudentFinance(db, "account-a", "2026-02-01").overdueBalance,
    100,
  );
});
test("missing billing stays unknown and settled overdue charges clear derived restrictions", () => {
  const db = accountData();
  db.installments[0].penaltyBalance = null;
  assert.equal(
    selectedStudentFinance(db, "account-a", "2026-02-01").overdueBalance,
    null,
  );
  db.installments[0].balance = 0;
  db.installments[0].penaltyBalance = 0;
  const settled = selectedStudentFinance(db, "account-a", "2026-02-01");
  assert.equal(settled.overdueBalance, 0);
  assert.equal(
    financialAccess(settled.finance, settled.installments, "2026-02-01")
      .restricted,
    false,
  );
  assert.equal(
    financialAccess({ overdueBalance: 20, registrationOverride: true })
      .restricted,
    true,
  );
});
test("search matches name or Student ID without implicitly selecting or editing an account", () => {
  const db = accountData();
  assert.deepEqual(searchFinanceStudents(db.students, " FIRST "), [
    db.students[0],
  ]);
  assert.deepEqual(searchFinanceStudents(db.students, "ACCOUNT-B"), [
    db.students[1],
  ]);
  assert.deepEqual(searchFinanceStudents(db.students, "absent"), []);
});
test("override payload has exactly one selected target and a meaningful reason", () => {
  const db = accountData(),
    before = structuredClone(db);
  assert.throws(
    () =>
      registrationOverridePayload(null, {
        reason: "Valid review reason",
        registrationOverride: "true",
      }),
    /Select a student/,
  );
  assert.throws(
    () =>
      registrationOverridePayload(db.students[0], {
        reason: "        a   ",
        registrationOverride: "true",
      }),
    /at least 10/,
  );
  assert.throws(
    () =>
      registrationOverridePayload(db.students[0], {
        reason: "Valid review reason",
        registrationOverride: "invalid",
      }),
    /Choose/,
  );
  const payload = registrationOverridePayload(db.students[0], {
    reason: "  Approved after account review  ",
    registrationOverride: "true",
    studentId: "account-b",
    studentIds: ["account-b"],
    hold: false,
    aidPercent: 100,
  });
  assert.deepEqual(payload, {
    studentId: "account-a",
    registrationOverride: true,
    reason: "Approved after account review",
  });
  assert.deepEqual(db, before);
});
