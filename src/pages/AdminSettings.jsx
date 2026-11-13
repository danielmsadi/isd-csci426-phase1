import { useState } from "react";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Empty, Badge } from "../components/UI";
import { ApiForm, ResourceTable } from "../components/BackendUI";
import ManagementTabs from "../components/ManagementTabs";
import {
  semesterFields,
  validateSemester,
  semesterEvents,
} from "../data/semester";
export default function AdminSettings() {
  const { db } = usePortal();
  const [tab, setTab] = useState("management"),
    [selected, setSelected] = useState("");
  const current =
    selected === "current"
      ? db.settings
      : db.semesters.find((s) => s.id === selected);
  const initial = current
    ? { ...current, semester: current.semester || current.name }
    : {};
  const events = semesterEvents(current);
  return (
    <>
      <PageHeader
        eyebrow="ACADEMIC ADMINISTRATION"
        title="Academic calendar"
        description="Manage semesters, registration windows, credit limits and payment deadlines."
      />
      <ManagementTabs
        label="calendar"
        tabs={[
          ["management", "Semester Management"],
          ["overview", "Calendar Overview"],
        ]}
        active={tab}
        onChange={setTab}
      />
      <Card title="Select a semester">
        <div className="padded">
          <label className="field">
            <span>Semester</span>
            <select
              aria-label="Calendar semester"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Create a new semester</option>
              {db.settings && (
                <option value="current">
                  Current settings · {db.settings.semester}
                </option>
              )}
              {db.semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.semester}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>
      <section
        role="tabpanel"
        id="calendar-management"
        aria-labelledby="calendar-tab-management"
        hidden={tab !== "management"}
      >
        <ApiForm
          key={selected + JSON.stringify(initial)}
          title={current ? "Edit semester" : "Create semester"}
          initial={initial}
          endpoint={
            selected === "current"
              ? "/settings/semester"
              : current
                ? `/semesters/${encodeURIComponent(current.id)}`
                : "/semesters"
          }
          method={selected === "current" ? "PUT" : current ? "PATCH" : "POST"}
          submitLabel={current ? "Save semester" : "Create semester"}
          validate={validateSemester}
          fields={semesterFields}
        />
        <ResourceTable
          title="Semesters"
          rows={db.semesters}
          columns={[
            "name",
            "registrationStart",
            "registrationEnd",
            "dropDeadline",
            "minCredits",
            "maxCredits",
          ]}
          empty="No semesters have been created."
          actions={(row) => (
            <button
              className="button secondary small"
              onClick={() => setSelected(row.id)}
            >
              Edit semester
            </button>
          )}
        />
      </section>
      <section
        role="tabpanel"
        id="calendar-overview"
        aria-labelledby="calendar-tab-overview"
        hidden={tab !== "overview"}
      >
        <Card
          title="Important academic dates"
          subtitle={
            current?.name ||
            current?.semester ||
            "Select a saved semester to see its timeline."
          }
        >
          {events.length ? (
            <ol className="academic-timeline">
              {events.map((event) => (
                <li key={event.id}>
                  <time dateTime={event.date}>
                    {new Date(event.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </time>
                  <div>
                    <h3>{event.label}</h3>
                    <Badge>
                      {event.date < new Date().toLocaleDateString("en-CA")
                        ? "Past"
                        : "Upcoming"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Empty text="No academic dates are available for this semester. Saved deadlines will appear here." />
          )}
        </Card>
      </section>
      <Card
        title="Registration policy"
        subtitle="Registration, payment and academic-record requirements."
      >
        <div className="padded policy-list">
          <p>
            Courses can be taken only once. Full sections close automatically,
            with no waitlist.
          </p>
          <p>
            Dropping before the deadline gives a full refund. Tuition is divided
            into four equal installments, with a one-time $20 penalty for each
            late installment.
          </p>
          <p>
            Overdue payments restrict grades, GPA, transcripts and next-semester
            registration. Admin may override registration holds only.
          </p>
          <p>
            Approved major changes take effect next semester. Review your
            semester dates and account status before requesting changes.
          </p>
        </div>
      </Card>
    </>
  );
}
