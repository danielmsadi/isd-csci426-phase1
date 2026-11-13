import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePortal } from "../data/PortalContext";
import { Card, Field, PageHeader } from "../components/UI";
import { AssessmentEditor, RulesEditor } from "../components/GradingEditors";
import { assessmentLock } from "../data/gradingWorkflow";
import { validateAssessments, validateRules } from "../data/grading";
function CourseStructure({ courseId, unsavedScores }) {
  const { db, api, reload, role } = usePortal();
  const saved = db.assessmentStructures.find((s) => s.courseId === courseId);
  const locked =
    assessmentLock(db, courseId) ||
    (unsavedScores
      ? "Save or discard Gradebook edits before changing assessment structures."
      : null);
  const [items, setItems] = useState(() =>
    structuredClone(saved?.assessments || []),
  );
  const [dirty, setDirty] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!dirty) setItems(structuredClone(saved?.assessments || []));
  }, [saved, dirty]);
  async function save() {
    setError("");
    setMessage("");
    const invalid =
      role !== "admin"
        ? "Only Admin can manage assessments."
        : locked || validateAssessments(items);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!courseId) {
      setError("Select a course before saving.");
      return;
    }
    setBusy(true);
    try {
      await api.request(
        `/assessment-structures/${encodeURIComponent(courseId)}`,
        {
          method: "PUT",
          body: {
            version: saved?.version ?? null,
            assessments: items.map((a) => ({
              ...a,
              name: a.name.trim(),
              weight: Number(a.weight),
              maximum: Number(a.maximum),
            })),
          },
        },
      );
      setDirty(false);
      await reload();
      setMessage("Assessment structure saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card
      title="Course assessment structure"
      subtitle="One course structure is shared by every section. Define Test 1, Midterm, Project, Final or other assessments."
    >
      <div className="padded">
        {locked && <div className="alert warning">{locked}</div>}
        <fieldset
          className="editor-fieldset"
          disabled={busy || !!locked || role !== "admin"}
        >
          <AssessmentEditor
            items={items}
            onChange={(value) => {
              setItems(value);
              setDirty(true);
              setMessage("");
            }}
          />
        </fieldset>
        <p className="form-description">
          {dirty
            ? "Unsaved changes · leaving this course discards your edits."
            : saved
              ? "Saved assessment structure"
              : "No saved structure available."}
        </p>
        {error && (
          <div className="alert warning" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="alert info" role="status">
            {message}
          </div>
        )}
        <button
          className="button primary"
          disabled={busy || !courseId || !!locked || role !== "admin"}
          onClick={save}
        >
          {busy ? "Saving…" : "Save assessment structure"}
        </button>
      </div>
    </Card>
  );
}
function GradingRules() {
  const { db, api, reload, role } = usePortal();
  const [rules, setRules] = useState(() =>
    structuredClone(
      db.gradingRules || { bands: [], decimals: 2, roundBeforeGrading: false },
    ),
  );
  const [dirty, setDirty] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!dirty && db.gradingRules) setRules(structuredClone(db.gradingRules));
  }, [db.gradingRules, dirty]);
  async function save() {
    setError("");
    setMessage("");
    const invalid =
      role !== "admin"
        ? "Only Admin can configure grading rules."
        : validateRules(rules);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    try {
      await api.request("/settings/grading", {
        method: "PUT",
        body: {
          ...rules,
          bands: rules.bands.map((b) => ({
            ...b,
            minimum: Number(b.minimum),
            points: Number(b.points),
          })),
        },
      });
      setDirty(false);
      await reload();
      setMessage("Grading rules saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card
      title="Grading scale"
      subtitle="Configure letter grades, grade points and percentage rounding."
    >
      <div className="padded">
        <fieldset className="editor-fieldset" disabled={busy}>
          <RulesEditor
            rules={rules}
            onChange={(r) => {
              setRules(r);
              setDirty(true);
              setMessage("");
            }}
          />
        </fieldset>
        {dirty && <p className="form-description">Unsaved changes</p>}
        {error && (
          <div className="alert warning" role="alert">
            {error}
          </div>
        )}
        {message && <p role="status">{message}</p>}
        <button className="button primary" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save grading rules"}
        </button>
      </div>
    </Card>
  );
}
export default function Assessments({
  embedded = false,
  courseId,
  setCourseId,
  unsavedScores,
}) {
  const { db } = usePortal();
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="ACADEMIC ADMINISTRATION"
          title="Course assessments"
          description="Organize assessment weights and grading rules before entering results."
        >
          <Link className="button secondary" to="/admin/gradebook">
            Open Gradebook
          </Link>
        </PageHeader>
      )}
      <Card title="Select a course">
        <div className="padded">
          <Field label="Course">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={!db.courses.length}
            >
              <option value="">
                {db.courses.length ? "Select a course" : "No courses available"}
              </option>
              {db.courses.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>
      <CourseStructure
        key={courseId}
        courseId={courseId}
        unsavedScores={unsavedScores}
      />
      <GradingRules />
    </>
  );
}
