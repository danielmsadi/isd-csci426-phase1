import { financialAccess } from "../data/finance";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card } from "../components/UI";
import { ResourceTable, ServerAction } from "../components/BackendUI";
export default function Registration({ offerings = false }) {
  const { db } = usePortal();
  const access = financialAccess(db.finance, db.installments);
  const heldSection = (row) =>
    access.registrationRestricted &&
    Boolean(db.settings?.nextSemesterId || db.settings?.nextSemester) &&
    (row.semesterId === db.settings?.nextSemesterId ||
      row.semester === db.settings?.nextSemester);
  return (
    <>
      <PageHeader
        title={
          offerings ? "Find your next course." : "Your semester, your schedule."
        }
        description={
          offerings
            ? "Explore courses, sections, instructors and schedules."
            : "Manage your registered courses and review enrollment requirements."
        }
      />
      <div className="info-strip">
        <span>Semester: {db.settings?.semester || "Not configured"}</span>
        <span>
          Registration deadline:{" "}
          {db.settings?.registrationEnd || "Not configured"}
        </span>
        <span>
          Drop deadline: {db.settings?.dropDeadline || "Not configured"}
        </span>
      </div>
      {!offerings && (
        <ResourceTable
          title="My registered courses"
          rows={db.enrollments}
          columns={[
            "courseCode",
            "courseName",
            "credits",
            "section",
            "schedule",
            "room",
          ]}
          empty="No registered courses are available."
          actions={(row) => (
            <ServerAction
              label="Drop course"
              endpoint={`/enrollments/${encodeURIComponent(row.id)}`}
              method="DELETE"
              confirmation="Request to drop this course? The university will confirm deadline eligibility and the full refund."
            />
          )}
        />
      )}
      <ResourceTable
        title="Course offerings"
        rows={db.sections}
        columns={[
          "courseCode",
          "courseName",
          "credits",
          "prerequisites",
          "section",
          "instructor",
          "room",
          "schedule",
          "availableSeats",
        ]}
        filterKey="department"
        filterLabel="Departments"
        empty="No course offerings are available yet. Sections will appear when published by the university."
        actions={(row) => (
          <ServerAction
            label={
              heldSection(row)
                ? "Registration hold"
                : row.availableSeats <= 0
                  ? "Section closed"
                  : "Register"
            }
            disabled={
              heldSection(row) ||
              row.availableSeats == null ||
              row.availableSeats <= 0
            }
            endpoint="/enrollments"
            body={{ sectionId: row.id }}
            confirmation="Request registration in this section? Eligibility, available capacity and tuition must be confirmed by the connected service."
          />
        )}
      />
      <Card
        title="Registration guidelines"
        subtitle="Review eligibility and deadlines before making changes."
      >
        <div className="padded policy-list">
          <p>
            Prerequisites, capacity, schedule conflicts, credit limits,
            registration deadlines and financial holds must be checked before
            enrollment.
          </p>
          <p>
            Courses may be taken only once. Full sections are closed; there is
            no waitlist. Dropping before the deadline qualifies for a full
            refund.
          </p>
          <p>
            The university service will confirm eligibility and process changes
            when connected.
          </p>
        </div>
      </Card>
    </>
  );
}
