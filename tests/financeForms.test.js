import test from "node:test";
import assert from "node:assert/strict";
import {
  studentSemesterFinance,
  validateOfficePayment,
  aidDecisionPayload,
} from "../src/data/finance.js";
const installment = {
  id: "i1",
  studentId: "s1",
  semesterId: "term1",
  number: 1,
  balance: 100,
  penaltyBalance: 20,
};
const request = { id: "r1", type: "Aid", studentId: "s1", semesterId: "term1" };
test("semester finance excludes other students, semesters and unassigned records", () => {
  const db = {
    students: [
      {
        id: "s1",
        finance: { studentId: "s1", semesterId: "term2", balance: 999 },
      },
    ],
    semesters: [{ id: "term1" }],
    installments: [
      installment,
      { ...installment, id: "i2", semesterId: "term2" },
      { ...installment, id: "i3", studentId: "s2" },
      { ...installment, id: "i4", semesterId: undefined },
    ],
    payments: [
      { id: "p1", studentId: "s1", semesterId: "term1" },
      { id: "p2", studentId: "s1", semesterId: "term2" },
    ],
    requests: [
      request,
      { ...request, id: "r2", semesterId: "term2" },
      { ...request, id: "r3", studentId: "s2" },
    ],
  };
  const before = structuredClone(db);
  const scope = studentSemesterFinance(db, "s1", "term1");
  assert.equal(scope.finance, null);
  assert.deepEqual(scope.installments, [installment]);
  assert.deepEqual(scope.requests, [request]);
  assert.equal(scope.payments.length, 1);
  assert.deepEqual(studentSemesterFinance(db, "s1", "missing").requests, []);
  assert.deepEqual(studentSemesterFinance(db, "", "term1").installments, []);
  assert.deepEqual(db, before);
});
test("office payments validate account, semester, balance, date and receipt", () => {
  const values = {
    installmentId: "i1",
    amount: 120,
    date: "2026-11-12",
    reference: "RC-1",
  };
  assert.equal(
    validateOfficePayment(values, "s1", "term1", [installment]),
    null,
  );
  for (const change of [
    { amount: 121 },
    { amount: 0 },
    { amount: Infinity },
    { date: "2026-02-30" },
    { date: "" },
    { reference: "  " },
  ])
    assert.ok(
      validateOfficePayment({ ...values, ...change }, "s1", "term1", [
        installment,
      ]),
    );
  assert.ok(validateOfficePayment(values, "s2", "term1", [installment]));
  assert.ok(validateOfficePayment(values, "s1", "term2", [installment]));
});
test("aid decisions allow zero through 100 percent and target exactly one student semester", () => {
  const values = {
    status: "Approved",
    aidPercent: 0,
    decisionNote: "Reviewed award",
  };
  assert.deepEqual(aidDecisionPayload(request, "s1", "term1", values), {
    studentId: "s1",
    semesterId: "term1",
    ...values,
  });
  assert.equal(
    aidDecisionPayload(request, "s1", "term1", { ...values, aidPercent: 100 })
      .aidPercent,
    100,
  );
  assert.equal(
    aidDecisionPayload(request, "s1", "term1", {
      ...values,
      status: "Rejected",
      aidPercent: 50,
    }).aidPercent,
    0,
  );
  for (const aidPercent of [null, "", -1, 101, Infinity])
    assert.throws(() =>
      aidDecisionPayload(request, "s1", "term1", { ...values, aidPercent }),
    );
  assert.throws(() => aidDecisionPayload(request, "s2", "term1", values));
  assert.throws(() => aidDecisionPayload(request, "s1", "term2", values));
  assert.throws(() => aidDecisionPayload(null, "s1", "term1", values));
});
