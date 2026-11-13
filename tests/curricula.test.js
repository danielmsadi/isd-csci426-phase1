import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"),
  );
const programs = read("publicPrograms"),
  curricula = read("publicCurricula");
test("every documented program has local factual course entries without malformed text", () => {
  assert.equal(Object.keys(curricula).length, programs.length);
  for (const p of programs) {
    const rows = curricula[p.id].courses;
    assert.ok(rows.length > 0, p.name);
    for (const c of rows) {
      assert.match(c.code, /^[A-Z]{3,5}\d{3,4}[A-Z]?$/);
      assert.ok(c.name && c.credits > 0 && Number.isFinite(c.credits));
      assert.doesNotMatch(
        c.name + c.prerequisites + c.corequisites,
        /[\u0000-\u001f\ufffd]/,
      );
    }
  }
});
test("all displayed semester plans reconcile to published graduation credits", () => {
  let complete = 0;
  for (const p of programs) {
    const plan = curricula[p.id].plan;
    if (!plan.length) continue;
    complete++;
    for (const term of plan)
      assert.equal(
        term.courses.reduce((sum, c) => sum + c.credits, 0),
        term.totalCredits,
        p.name,
      );
    assert.equal(
      plan.reduce((sum, t) => sum + t.totalCredits, 0),
      p.credits,
      p.name,
    );
  }
  assert.equal(complete, 53);
});
test("course prerequisites and corequisites preserve distinct source columns", () => {
  const c = curricula["engineering-computer-engineering"].courses.find(
    (c) => c.code === "CSCI250",
  );
  assert.equal(c.prerequisites, "");
  assert.equal(c.corequisites, "ENGL101 - CSCI250L");
  const cs = curricula["arts-sciences-computer-science"].courses.find(
    (c) => c.code === "CSCI490",
  );
  assert.equal(cs.name, "Information System Development");
  assert.equal(cs.credits, 3);
  assert.equal(cs.prerequisites, "CSCI390-CSCI380");
});
