import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, List } from "lucide-react";
import { usePortal } from "../data/PortalContext";
import { Card, Empty, PageHeader } from "../components/UI";
import { ResourceTable } from "../components/BackendUI";

export default function Schedule() {
  const { db } = usePortal();
  const [view, setView] = useState("agenda");
  return (
    <>
      <PageHeader
        title="Make room for your next chapter."
        description="Your registered classes, meeting times, instructors, and rooms."
      >
        <Link className="button secondary" to="/student/registration">
          Manage registration
        </Link>
      </PageHeader>
      <div className="schedule-heading">
        <span>{db.settings?.semester || "Semester not configured"}</span>
        <div className="button-row">
          <button
            className={`button ${view === "agenda" ? "primary" : "secondary"}`}
            aria-pressed={view === "agenda"}
            onClick={() => setView("agenda")}
          >
            <List size={16} />
            Agenda
          </button>
          <button
            className={`button ${view === "courses" ? "primary" : "secondary"}`}
            aria-pressed={view === "courses"}
            onClick={() => setView("courses")}
          >
            <CalendarDays size={16} />
            Course cards
          </button>
        </div>
      </div>
      {view === "agenda" ? (
        <ResourceTable
          title="Class schedule"
          rows={db.enrollments}
          columns={[
            "courseCode",
            "courseName",
            "section",
            "instructor",
            "room",
            "schedule",
          ]}
          empty="No registered classes yet. Your schedule will appear once registration records are available."
        />
      ) : (
        <Card title="Your classes">
          {db.enrollments.length ? (
            <div className="schedule-cards">
              {db.enrollments.map((row) => (
                <article className="schedule-course" key={row.id}>
                  <span className="eyebrow">{row.courseCode}</span>
                  <h3>{row.courseName}</h3>
                  <p>{row.schedule || "Meeting time not provided"}</p>
                  <dl>
                    <dt>Section</dt>
                    <dd>{row.section || "—"}</dd>
                    <dt>Instructor</dt>
                    <dd>{row.instructor || "—"}</dd>
                    <dt>Room</dt>
                    <dd>{row.room || "—"}</dd>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <Empty text="No classes to display. Explore course offerings to plan your schedule." />
          )}
        </Card>
      )}
    </>
  );
}
