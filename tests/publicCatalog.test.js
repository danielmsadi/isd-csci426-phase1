import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const catalog = JSON.parse(
  readFileSync(
    new URL("../docs/research-programs.json", import.meta.url),
    "utf8",
  ),
);
test("internal research keeps traceable sources and unique routes", () => {
  assert.equal(catalog.length, 65);
  assert.equal(new Set(catalog.map((p) => p.id)).size, catalog.length);
  for (const program of catalog) {
    assert.ok(program.name);
    assert.ok(Number.isInteger(program.credits) && program.credits > 0);
    assert.equal(program.verifiedOn, "2026-11-11");
    assert.equal(new URL(program.source).hostname, "liu.edu.lb");
    for (const key of ["contract", "plan", "courses"])
      if (program[key])
        assert.match(new URL(program[key]).hostname, /(^|\.)liu\.edu\.lb$/);
  }
});
test("internal research retains legacy review flags", () => {
  const legacy = catalog.filter((p) => p.legacy);
  assert.equal(legacy.length, 3);
  assert.ok(
    legacy.every((p) => p.school === "arts-sciences" && p.level === "Graduate"),
  );
});

test("runtime catalog preserves factual credits but excludes research metadata", () => {
  const runtime = JSON.parse(
    readFileSync(
      new URL("../src/data/publicPrograms.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    runtime.map((p) => p.id),
    catalog.map((p) => p.id),
  );
  for (const program of runtime)
    assert.deepEqual(Object.keys(program).sort(), [
      "credits",
      "id",
      "level",
      "name",
      "school",
    ]);
});
