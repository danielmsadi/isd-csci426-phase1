import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyPortal, normalizePortal } from "../src/data/emptyPortal.js";
import { createApi, BackendUnavailableError } from "../src/data/api.js";

test("initial state contains only empty collections and absent records", () => {
  for (const value of Object.values(createEmptyPortal())) {
    if (Array.isArray(value)) assert.equal(value.length, 0);
    else assert.equal(value, null);
  }
});
test("each state initialization has independent collections", () => {
  const first = createEmptyPortal(),
    second = createEmptyPortal();
  assert.notEqual(first.students, second.students);
  assert.notEqual(first.courses, second.courses);
});

test("current student and directory share the same canonical record", () => {
  const payload = {
    students: [{ id: "record", name: "Official name" }],
    currentStudent: { id: "record" },
  };
  const state = normalizePortal(payload);
  assert.equal(state.currentStudent, state.students[0]);
  assert.equal(state.currentStudent.name, "Official name");
});
test("normalization does not manufacture records or financial totals", () => {
  assert.deepEqual(normalizePortal({}), createEmptyPortal());
  assert.throws(() => normalizePortal(null), /Invalid portal/);
  assert.throws(() => normalizePortal({ students: {} }), /Invalid students/);
});
test("an unconfigured API rejects reads and writes instead of simulating success", async () => {
  const api = createApi();
  assert.equal(api.configured, false);
  await assert.rejects(api.request("/portal/student"), BackendUnavailableError);
  await assert.rejects(
    api.request("/students", { method: "POST", body: {} }),
    /Nothing has been saved or sent/,
  );
});
