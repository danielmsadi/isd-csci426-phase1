import { brand } from "../data/brand";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Wallet,
  Users,
  FileCheck2,
  Sparkles,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { financialAccess } from "../data/finance";
import { usePortal } from "../data/PortalContext";
import { PageHeader, Card, Stat, Empty } from "../components/UI";
import { ResourceTable, currency } from "../components/BackendUI";
export default function Dashboard() {
  const { db, role } = usePortal();
  const admin = role === "admin";
  const summary = db.summary;
  const links = admin
    ? [
        ["students", "Student accounts", Users],
        ["courses", "Courses & degree plans", BookOpen],
        ["sections", "Sections & schedules", CalendarDays],
        ["grade-management", "Grade Management", GraduationCap],
        ["finance", "Tuition & payments", Wallet],
        ["requests", "Applications & approvals", FileCheck2],
      ]
    : [
        ["grades", "Grades & transcript", GraduationCap],
        ["finance", "Tuition & payments", Wallet],
        ["degree", "My degree plan", BookOpen],
        ["profile", "Student profile", Users],
      ];
  return (
    <>
      <PageHeader
        eyebrow={admin ? "REGISTRAR WORKSPACE" : "STUDENT PORTAL"}
        title={
          admin
            ? "Administration overview"
            : "Your university journey starts here."
        }
        description={
          admin
            ? "Manage academic services and student administration in one place."
            : "A clear view of your courses, progress, and next steps."
        }
      />
      {!admin && (
        <section className="welcome-banner">
          <div className="banner-content">
            <span className="banner-tag">{brand.name}</span>
            <h2>
              Your next chapter,
              <br />
              one course at a time.
            </h2>
            <p>
              Explore your academic path and keep everything
              <br />
              you need for university within reach.
            </p>
            <Link className="button white" to="/student/offerings">
              Explore course offerings <ArrowRight size={16} />
            </Link>
          </div>
          <div className="banner-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-grid" />
            <GraduationCap className="large-cap" strokeWidth={0.8} />
            <div className="art-caption">LEARN. GROW. LEAD.</div>
          </div>
        </section>
      )}
      <div className="stats-grid">
        {(admin
          ? [
              ["Student accounts", summary?.studentCount, Users],
              ["Active sections", summary?.sectionCount, BookOpen],
              ["Pending requests", summary?.pendingRequestCount, FileCheck2],
              [
                "Payments received",
                summary?.paymentsReceived == null
                  ? null
                  : currency(summary.paymentsReceived),
                Wallet,
              ],
            ]
          : [
              ["Enrolled credits", summary?.enrolledCredits, BookOpen],
              [
                "Cumulative GPA",
                financialAccess(db.finance, db.installments).restricted
                  ? "Restricted"
                  : summary?.gpa,
                GraduationCap,
              ],
              [
                "Outstanding balance",
                summary?.balance == null ? null : currency(summary.balance),
                Wallet,
              ],
              [
                "Degree progress",
                summary?.degreeProgress == null
                  ? null
                  : `${summary.degreeProgress}%`,
                FileCheck2,
              ],
            ]
        ).map(([label, value, icon]) => (
          <Stat
            key={label}
            label={label}
            value={value ?? "—"}
            detail={value == null ? "Not available yet" : "University records"}
            icon={icon}
          />
        ))}
      </div>
      <div className="dashboard-grid">
        <div>
          {admin ? (
            <Card
              title="Administration workspace"
              subtitle="Tools for each stage of the academic journey."
            >
              <div className="admin-shortcuts">
                {links.map(([path, title, Icon]) => (
                  <Link to={`/admin/${path}`} key={path}>
                    <span className="icon-box blue">
                      <Icon size={20} />
                    </span>
                    <div>
                      <b>{title}</b>
                      <small>Open workspace</small>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            </Card>
          ) : (
            <ResourceTable
              title="My class schedule"
              rows={db.enrollments}
              columns={[
                "courseCode",
                "courseName",
                "section",
                "instructor",
                "room",
                "schedule",
              ]}
              empty="No registered courses to display. Your class schedule will appear here once available."
            />
          )}
          <Card
            title="University announcements"
            subtitle="Stay informed about academic services and important dates."
          >
            {db.announcements.length ? (
              db.announcements.map((item) => (
                <article className="padded" key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))
            ) : (
              <Empty text="There are no announcements to display." />
            )}
          </Card>
        </div>
        <div>
          <Card title={admin ? "Academic calendar" : "Quick access"}>
            {admin ? (
              <div className="semester-info">
                <p>Current semester</p>
                <b>{db.settings?.semester || "Not configured"}</b>
                <p>Registration deadline</p>
                <b>{db.settings?.registrationEnd || "Not configured"}</b>
                <p>Drop deadline</p>
                <b>{db.settings?.dropDeadline || "Not configured"}</b>
                <Link className="button secondary full" to="/admin/settings">
                  Manage semester rules
                </Link>
              </div>
            ) : (
              <div className="quick-links">
                {links.map(([path, title, Icon]) => (
                  <Link key={path} to={`/student/${path}`}>
                    <Icon size={18} />
                    <span>{title}</span>
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
          {!admin && (
            <section className="advisor-card">
              <span className="advisor-icon">
                <Sparkles />
              </span>
              <h2>
                A clearer path
                <br />
                to your future.
              </h2>
              <p>
                Your degree plan and advisor will help you prepare for what
                comes next.
              </p>
              <Link className="button secondary full" to="/student/degree">
                View degree plan <ArrowRight size={16} />
              </Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
