import { useState } from "react";
import { Link } from "react-router-dom";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Stat, Empty } from "../components/UI";
import { ResourceTable, ServerAction } from "../components/BackendUI";
import {
  publishedGrades,
  publishedAssessmentCourses,
  semesterGradePointAverage,
} from "../data/grading";
import { financialAccess } from "../data/finance";
export default function Grades() {
  const { db } = usePortal();
  const [semester, setSemester] = useState(""),
    [expanded, setExpanded] = useState(null);
  const grades = publishedGrades(db);
  const assessmentCourses = publishedAssessmentCourses(db);
  const semesterKey = (grade) => grade.semesterId || grade.semester;
  const semesters = [
    ...new Map(
      [...grades, ...assessmentCourses].map((g) => [
        semesterKey(g),
        g.semester || g.semesterId,
      ]),
    ).entries(),
  ].filter(([id]) => id);
  const visible = grades.filter(
    (g) => !semester || semesterKey(g) === semester,
  );
  const availableCourses = assessmentCourses.filter(
    (g) => !semester || semesterKey(g) === semester,
  );
  const selected =
    availableCourses.find((g) => g.id === expanded) ||
    visible.find((g) => g.id === expanded);
  const semesterGpa = semester ? semesterGradePointAverage(visible) : null;
  if (financialAccess(db.finance, db.installments).restricted)
    return (
      <>
        <PageHeader
          title="Academic records"
          description="Grades, assessment breakdowns and transcripts."
        />
        <Card>
          <div className="restricted">
            <h2>Academic records are restricted</h2>
            <p>
              Settle all overdue installments and fees to access grades, GPA and
              transcripts. A registration override does not release academic
              records.
            </p>
            <Link className="button primary" to="/student/finance">
              View tuition
            </Link>
          </div>
        </Card>
      </>
    );
  return (
    <>
      <PageHeader
        title="Every achievement counts."
        description="Review released assessment results and published final grades. Unpublished marks stay private."
      >
        <ServerAction
          label="Download transcript"
          endpoint="/students/me/transcript"
          method="GET"
          filename="academic-transcript.pdf"
          disabled={!grades.length}
        />
      </PageHeader>
      <div className="stats-grid">
        <Stat
          label="Semester GPA"
          value={semesterGpa?.toFixed(2) ?? "—"}
          detail={
            semester
              ? "Credit-weighted published results"
              : "Select a semester below"
          }
        />
        <Stat
          label="Cumulative GPA"
          value={grades.length ? (db.summary?.gpa ?? "—") : "—"}
          detail="Published academic record summary"
        />
        <Stat
          label="Completed credits"
          value={grades.length ? (db.summary?.completedCredits ?? "—") : "—"}
          detail="From university records"
        />
        <Stat
          label="Academic standing"
          value={grades.length ? (db.summary?.academicStanding ?? "—") : "—"}
          detail="Confirmed by the registrar"
        />
      </div>
      <div className="toolbar">
        <label className="field">
          <span>Semester</span>
          <select
            aria-label="Grades semester"
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setExpanded(null);
            }}
            disabled={!semesters.length}
          >
            <option value="">All published semesters</option>
            {semesters.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ResourceTable
        title="Grade report"
        rows={visible}
        columns={[
          "courseCode",
          "courseName",
          "semester",
          "credits",
          "grade",
          "total",
          "gpa",
        ]}
        empty="No published grades are available."
        actions={(row) => (
          <button
            className="button secondary small"
            aria-expanded={expanded === row.id}
            aria-controls="course-assessment-breakdown"
            onClick={() => setExpanded(expanded === row.id ? null : row.id)}
          >
            {expanded === row.id ? "Hide assessments" : "View assessments"}
          </button>
        )}
      />
      <div id="course-assessment-breakdown" aria-live="polite">
        <Card
          title="Published assessments"
          subtitle="Assessment results can be released before a final grade is published."
        >
          <div className="padded">
            <label className="field">
              <span>Course assessment results</span>
              <select
                aria-label="Course assessment results"
                value={expanded || ""}
                disabled={!availableCourses.length}
                onChange={(e) => setExpanded(e.target.value || null)}
              >
                <option value="">Select a course</option>
                {availableCourses.map((g) => (
                  <option value={g.id} key={g.id}>
                    {g.courseCode} · {g.courseName} · {g.semester}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>
        {selected ? (
          <ResourceTable
            title={`Assessment breakdown · ${selected.courseCode || selected.courseName}`}
            rows={selected.assessments || []}
            columns={[
              "name",
              {
                key: "weight",
                label: "Weight",
                render: (a) => (a.weight == null ? "—" : `${a.weight}%`),
              },
              "score",
              "maximum",
            ]}
            empty="No assessment results have been published for this course."
          />
        ) : (
          <Card title="Assessment breakdown">
            <Empty
              text={
                grades.length || assessmentCourses.length
                  ? "Select a course above to expand its published assessment breakdown."
                  : "Assessment results will appear once published."
              }
            />
          </Card>
        )}
      </div>
    </>
  );
}
