import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePortal } from "../data/PortalContext";
import { Card, Empty, Field, Modal, Badge } from "../components/UI";
import {
  gradeWorkspace,
  draftPayload,
  publicationPayload,
  scoreMissing,
  scoreValid,
} from "../data/gradingWorkflow";
import { isPublished } from "../data/grading";
function GradeGrid({ semesterId, courseId, sectionId, onDirtyChange }) {
  const { db, api, reload, role } = usePortal();
  const [edits, setEdits] = useState({}),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmation, setConfirmation] = useState(null),
    [query, setQuery] = useState(""),
    [assessmentId, setAssessmentId] = useState("");
  const workspace = gradeWorkspace(
    db,
    { semesterId, courseId, sectionId },
    edits,
  );
  const { rows, assessments, structureError, dirty } = workspace;
  const admin = role === "admin";
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  async function send(action) {
    setConfirmation(null);
    setError("");
    setMessage("");
    try {
      const body =
        action.type === "draft"
          ? draftPayload(workspace, role)
          : publicationPayload(workspace, action, role);
      setBusy(true);
      await api.request(
        `/gradebooks/${encodeURIComponent(sectionId)}${action.type === "draft" ? "" : "/publication"}`,
        { method: action.type === "draft" ? "PUT" : "PATCH", body },
      );
      if (action.type === "draft") setEdits({});
      await reload();
      setMessage(
        action.type === "draft"
          ? "Grade drafts saved."
          : "Publication confirmed by the university service.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function requestPublication(action) {
    setError("");
    try {
      publicationPayload(workspace, action, role);
      setConfirmation(action);
    } catch (err) {
      setError(err.message);
    }
  }
  function saveDraft() {
    setError("");
    try {
      draftPayload(workspace, role);
      const affectsPublished = rows.some(
        (row) =>
          row.changed &&
          (isPublished(row.record || {}) ||
            row.record?.assessments?.some(isPublished)),
      );
      if (affectsPublished)
        setConfirmation({
          type: "draft",
          label: "Save revised results as draft",
        });
      else send({ type: "draft" });
    } catch (err) {
      setError(err.message);
    }
  }
  const visible = rows.filter((row) =>
    `${row.student.name} ${row.student.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const assessment = assessments.find((a) => a.id === assessmentId);
  const assessmentTargets = assessment
    ? rows
        .filter(
          (row) =>
            row.record &&
            !row.conflict &&
            scoreValid(row.scores[assessment.id], assessment) &&
            !isPublished(
              row.record.assessments?.find(
                (a) => a.assessmentId === assessment.id,
              ) || {},
            ),
        )
        .map((row) => row.student.id)
    : [];
  const finalTargets = rows
    .filter((row) => row.eligible)
    .map((row) => row.student.id);
  return (
    <>
      <Card
        title="Assessment scores"
        subtitle="Select an assessment to enter scores. Final results use all weighted assessments."
      >
        <div className="padded">
          <div className="form-grid">
            <Field label="Assessment">
              <select
                aria-label="Grade assessment"
                value={assessmentId}
                disabled={!sectionId || !assessments.length || busy}
                onChange={(e) => setAssessmentId(e.target.value)}
              >
                <option value="">
                  {assessments.length
                    ? "Select assessment"
                    : "No assessments available"}
                </option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.weight}% · out of {a.maximum}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Search registered students">
              <input
                value={query}
                placeholder="Name or Student ID"
                onChange={(e) => setQuery(e.target.value)}
              />
            </Field>
          </div>
          <p>{rows.length} registered students</p>
          {!sectionId ? (
            <Empty text="Select a semester, course and section to enter grades." />
          ) : (
            <>
              {structureError && (
                <div className="alert warning">
                  {structureError}{" "}
                  <Link to="/admin/courses?view=assessments">
                    Configure course assessments
                  </Link>
                </div>
              )}
              {!rows.length ? (
                <Empty text="No registered students are available for this section." />
              ) : (
                <div className="table-wrap gradebook-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>
                          Score{assessment ? ` / ${assessment.maximum}` : ""}
                        </th>
                        <th>Status &amp; calculated results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((row) => {
                        const score = assessment
                          ? row.scores[assessment.id]
                          : "";
                        const missing = scoreMissing(score);
                        const invalid =
                          assessment &&
                          !missing &&
                          !scoreValid(score, assessment);
                        const savedAssessment = row.record?.assessments?.find(
                          (a) => a.assessmentId === assessmentId,
                        );
                        const savedScore = savedAssessment?.score;
                        const changedScore =
                          assessment &&
                          !(scoreMissing(score) && scoreMissing(savedScore)) &&
                          String(score) !== String(savedScore ?? "");
                        return (
                          <tr key={row.student.id}>
                            <th scope="row">{row.student.name}</th>
                            <td>{row.student.id}</td>
                            <td>
                              {assessment ? (
                                <>
                                  <input
                                    type="number"
                                    min="0"
                                    max={assessment.maximum}
                                    step="0.01"
                                    aria-label={`${row.student.name} · ${assessment.name}`}
                                    aria-invalid={!!invalid}
                                    value={score ?? ""}
                                    disabled={
                                      busy ||
                                      !admin ||
                                      !!row.conflict ||
                                      !!structureError
                                    }
                                    onChange={(e) => {
                                      setEdits((prev) => ({
                                        ...prev,
                                        [row.student.id]: {
                                          ...prev[row.student.id],
                                          [assessment.id]: e.target.value,
                                        },
                                      }));
                                      setError("");
                                      setMessage("");
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const tr =
                                          e.currentTarget.closest("tr");
                                        (e.shiftKey
                                          ? tr.previousElementSibling
                                          : tr.nextElementSibling
                                        )
                                          ?.querySelector("input")
                                          ?.focus();
                                      }
                                    }}
                                  />
                                  {missing && (
                                    <small className="missing-score">
                                      Missing score
                                    </small>
                                  )}
                                  {invalid && (
                                    <small className="score-error">
                                      Enter 0–{assessment.maximum}
                                    </small>
                                  )}
                                </>
                              ) : (
                                "Select an assessment"
                              )}
                            </td>
                            <td>
                              {assessment && (
                                <>
                                  <Badge>
                                    {changedScore
                                      ? "Unsaved"
                                      : isPublished(savedAssessment || {})
                                        ? "Published"
                                        : missing
                                          ? "Incomplete"
                                          : "Draft"}
                                  </Badge>
                                  <small>{assessment.name}</small>
                                </>
                              )}
                              <small>
                                Final: {row.changed ? "Unsaved" : row.status} ·{" "}
                                {row.result.complete && !row.result.error
                                  ? `${(row.result.displayedPercentage ?? row.result.percentage).toFixed(workspace.decimals)}% · ${row.result.letter} · GPA ${row.result.gpa}`
                                  : "Incomplete"}
                              </small>
                              {(row.conflict || row.result.error) && (
                                <small className="score-error">
                                  {row.conflict || row.result.error}
                                </small>
                              )}
                              <button
                                className="button secondary small"
                                disabled={
                                  busy || !admin || dirty || !row.eligible
                                }
                                onClick={() =>
                                  requestPublication({
                                    type: "final",
                                    studentIds: [row.student.id],
                                    label: "Publish final grade",
                                  })
                                }
                              >
                                Publish final grade
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!visible.length && (
                    <Empty text="No students match your search." />
                  )}
                </div>
              )}
            </>
          )}
          <p className="form-description">
            Blank scores remain incomplete. Draft saves include all pending
            assessment edits for changed students. Save drafts before
            publishing; final grades require all assessment scores and valid
            grading rules.
          </p>
          {dirty && (
            <p className="weight-warning" role="status">
              Unsaved changes · assessment selection keeps edits. Changing the
              class or leaving this page discards them.
            </p>
          )}
          <div className="button-row">
            <button
              className="button secondary"
              disabled={busy || !admin || !dirty || !!structureError}
              onClick={saveDraft}
            >
              Save draft
            </button>
            <button
              className="button primary"
              disabled={
                busy ||
                !admin ||
                dirty ||
                !!structureError ||
                !assessmentTargets.length
              }
              onClick={() =>
                requestPublication({
                  type: "assessment",
                  assessmentId,
                  studentIds: assessmentTargets,
                  label: `Publish ${assessment?.name}`,
                })
              }
            >
              Publish selected assessment
            </button>
            <button
              className="button secondary"
              disabled={busy || !admin || dirty || !finalTargets.length}
              onClick={() =>
                requestPublication({
                  type: "final",
                  studentIds: finalTargets,
                  label: "Publish final grades",
                })
              }
            >
              Publish all eligible final grades
            </button>
          </div>
          <p className="form-description">
            Publication applies to eligible students in the selected section,
            including students hidden by search. You will review the recipients
            before confirming.
          </p>
        </div>
      </Card>
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
      {confirmation && (
        <Modal title={confirmation.label} onClose={() => setConfirmation(null)}>
          <div className="padded">
            <p>
              {confirmation.type === "draft"
                ? "Changed students’ final grades and edited assessment results return to draft. Unchanged assessment publications and other students remain unchanged."
                : `Release ${confirmation.type === "assessment" ? "this assessment's results" : "final grades"} for ${confirmation.studentIds.length} eligible student(s) in this section? Other unpublished assessments will remain private. Financial holds still apply.`}
            </p>
            {confirmation.studentIds && (
              <ul className="publication-targets">
                {confirmation.studentIds.map((id) => (
                  <li key={id}>
                    {rows.find((r) => r.student.id === id)?.student.name} · {id}
                  </li>
                ))}
              </ul>
            )}
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => send(confirmation)}
              >
                {confirmation.type === "draft"
                  ? "Confirm save as draft"
                  : "Confirm publication"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export default function Gradebook({ courseId, setCourse, onDirtyChange }) {
  const { db } = usePortal();
  const [semesterId, setSemester] = useState(""),
    [sectionId, setSection] = useState("");
  useEffect(() => setSection(""), [courseId]);
  const semesters = db.semesters;
  const courses = db.courses.filter((c) =>
    db.sections.some((s) => s.courseId === c.id && s.semesterId === semesterId),
  );
  const sections = db.sections.filter(
    (s) => s.courseId === courseId && s.semesterId === semesterId,
  );
  return (
    <>
      <Card title="Choose a class">
        <div className="padded form-grid">
          <Field label="Semester">
            <select
              aria-label="Gradebook semester"
              value={semesterId}
              disabled={!semesters.length}
              onChange={(e) => {
                setSemester(e.target.value);
                setCourse("");
                setSection("");
              }}
            >
              <option value="">
                {semesters.length
                  ? "Select semester"
                  : "No semesters available"}
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Course">
            <select
              aria-label="Gradebook course"
              disabled={!semesterId || !courses.length}
              value={courseId}
              onChange={(e) => {
                setCourse(e.target.value);
                setSection("");
              }}
            >
              <option value="">
                {courses.length ? "Select course" : "No courses available"}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select
              aria-label="Gradebook section"
              disabled={!sections.length}
              value={sectionId}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="">
                {sections.length ? "Select section" : "No sections available"}
              </option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.section || s.name || s.id}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>
      <GradeGrid
        key={`${semesterId}/${courseId}/${sectionId}`}
        semesterId={semesterId}
        courseId={courseId}
        sectionId={sectionId}
        onDirtyChange={onDirtyChange}
      />
    </>
  );
}
