import { useSearchParams } from "react-router-dom";
import Assessments from "./Assessments";
import { useState } from "react";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Modal } from "../components/UI";
import {
  ApiForm,
  ResourceTable,
  optionsFrom,
  statusColumn,
} from "../components/BackendUI";
const courseFields = [
  { name: "code", label: "Course code" },
  { name: "name", label: "Course name" },
  { name: "credits", label: "Credits", type: "number", min: 1, max: 12 },
  { name: "department", label: "Department" },
  {
    name: "prerequisiteIds",
    label: "Prerequisite course IDs",
    required: false,
    hint: "Separate course IDs with commas. Existing courses must be validated by the university.",
  },
];
export function AdminCourses() {
  const [params] = useSearchParams();
  const [assessmentCourse, setAssessmentCourse] = useState("");
  const { db } = usePortal();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHeader
        eyebrow="ACADEMIC ADMINISTRATION"
        title="Courses & degree plans"
        description="Manage the academic catalog, prerequisites and program requirements."
      >
        <button className="button primary" onClick={() => setEditing({})}>
          Add course
        </button>
      </PageHeader>
      <details
        className="card padded"
        open={params.get("view") === "assessments" || undefined}
      >
        <summary>Course assessment structures &amp; grading rules</summary>
        <Assessments
          embedded
          courseId={assessmentCourse}
          setCourseId={setAssessmentCourse}
        />
      </details>
      <ResourceTable
        title="Course catalog"
        rows={db.courses}
        filterKey="department"
        filterLabel="Departments"
        columns={["code", "name", "credits", "department", "prerequisiteIds"]}
        empty="No courses have been published."
        actions={(row) => (
          <button
            className="button secondary small"
            onClick={() => setEditing(row)}
          >
            Edit course
          </button>
        )}
      />
      <div className="application-layout">
        <ApiForm
          title="Degree plan builder"
          endpoint="/degree-plans"
          submitLabel="Save degree plan"
          description="Assign a program's required courses using university course IDs."
          fields={[
            {
              name: "majorId",
              label: "Major",
              type: "select",
              options: optionsFrom(db.majors),
            },
            { name: "name", label: "Plan name" },
            {
              name: "courseIds",
              label: "Required course IDs",
              type: "textarea",
              hint: "Comma-separated IDs. The university service will verify each course.",
            },
          ]}
          transform={(values) => ({
            ...values,
            courseIds: values.courseIds
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          })}
        />
        <ApiForm
          title="Academic programs"
          endpoint="/majors"
          submitLabel="Create major"
          fields={[
            { name: "name", label: "Major name" },
            { name: "department", label: "Department" },
          ]}
        />
      </div>
      <ResourceTable
        title="Degree plans"
        rows={db.degreePlans}
        columns={["name", "majorName", "courseIds", "requiredCredits"]}
        empty="No degree plans are available."
      />
      {editing && (
        <Modal
          title={editing.id ? "Edit course" : "Add course"}
          onClose={() => setEditing(null)}
        >
          <ApiForm
            initial={{
              ...editing,
              prerequisiteIds: editing.prerequisiteIds?.join(", ") || "",
            }}
            fields={courseFields}
            endpoint={
              editing.id
                ? `/courses/${encodeURIComponent(editing.id)}`
                : "/courses"
            }
            method={editing.id ? "PATCH" : "POST"}
            submitLabel="Save course"
            onSuccess={() => setEditing(null)}
            transform={(values) => ({
              ...values,
              prerequisiteIds: values.prerequisiteIds
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            })}
          />
        </Modal>
      )}
    </>
  );
}
export function AdminSections() {
  const { db } = usePortal();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHeader
        eyebrow="ACADEMIC ADMINISTRATION"
        title="Sections & schedules"
        description="Coordinate instructors, rooms, meeting times and section capacity."
      >
        <button className="button primary" onClick={() => setEditing({})}>
          Add section
        </button>
      </PageHeader>
      <ResourceTable
        title="Semester sections"
        rows={db.sections}
        filterKey="status"
        columns={[
          "courseCode",
          "section",
          "instructor",
          "room",
          "schedule",
          "capacity",
          "enrolledCount",
          statusColumn,
        ]}
        empty="No sections have been scheduled."
        actions={(row) => (
          <button
            className="button secondary small"
            onClick={() => setEditing(row)}
          >
            Edit section
          </button>
        )}
      />
      {editing && (
        <Modal
          title={editing.id ? "Edit section" : "Add section"}
          onClose={() => setEditing(null)}
        >
          <ApiForm
            initial={editing}
            endpoint={
              editing.id
                ? `/sections/${encodeURIComponent(editing.id)}`
                : "/sections"
            }
            method={editing.id ? "PATCH" : "POST"}
            submitLabel="Save section"
            onSuccess={() => setEditing(null)}
            validate={(values) =>
              values.start >= values.end
                ? "End time must be after start time."
                : null
            }
            fields={[
              {
                name: "courseId",
                label: "Course",
                type: "select",
                options: optionsFrom(db.courses),
              },
              { name: "section", label: "Section code" },
              { name: "instructor", label: "Instructor" },
              { name: "room", label: "Room" },
              {
                name: "days",
                label: "Meeting days",
                hint: "Comma-separated weekdays",
              },
              { name: "capacity", label: "Capacity", type: "number", min: 1 },
              { name: "start", label: "Start time", type: "time" },
              { name: "end", label: "End time", type: "time" },
            ]}
          />
        </Modal>
      )}
    </>
  );
}
