import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePortal } from "../data/PortalContext";
import { ConnectionStatus } from "./BackendUI";
import Brand from "./Brand";
import { brand } from "../data/brand";
export default function Layout() {
  const { db, role } = usePortal();
  const navigate = useNavigate();
  const admin = role === "admin";
  const root = admin ? "/admin" : "/student";
  const [mobile, setMobile] = useState(false);
  const groups = admin
    ? [
        [
          "Academics",
          [
            ["Courses & degree plans", "courses"],
            ["Sections & schedules", "sections"],
            ["Academic calendar", "settings"],
            ["Grade Management", "grade-management"],
          ],
        ],
        [
          "Administration",
          [
            ["Student accounts", "students"],
            ["Overrides & exceptions", "overrides"],
            ["Applications & approvals", "requests"],
          ],
        ],
        ["Finance", [["Finance management", "finance"]]],
      ]
    : [
        [
          "Academics",
          [
            ["Course offerings", "offerings"],
            ["Course registration", "registration"],
            ["My schedule", "schedule"],
            ["Grades & transcript", "grades"],
            ["Degree plan & AI advisor", "degree"],
          ],
        ],
        [
          "Finance",
          [
            ["Tuition & payments", "finance"],
            ["Financial aid", "aid"],
          ],
        ],
        [
          "Services",
          [
            ["Major change", "major"],
            ["Registration overrides", "overrides"],
            ["My profile", "profile"],
          ],
        ],
      ];
  return (
    <div className="portal-shell">
      <div className="utility-bar">
        <span>{brand.name}</span>
        <span>{db.settings?.semester || "University Portal"}</span>
      </div>
      <header className="site-header">
        <div className="nav-shell">
          <Brand to={root} compact />
          <button
            className="mobile-toggle icon-button"
            aria-label="Toggle navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <nav className={mobile ? "open" : ""}>
            <NavLink end to={root} onClick={() => setMobile(false)}>
              Overview
            </NavLink>
            {groups.map(([name, links]) => (
              <details className="nav-dropdown" key={name}>
                <summary>
                  {name}
                  <ChevronDown size={13} />
                </summary>
                <div className="dropdown-panel">
                  {links.map(([label, path]) => (
                    <NavLink
                      key={path}
                      to={`${root}/${path}`}
                      onClick={(e) => {
                        e.currentTarget.closest("details").open = false;
                        setMobile(false);
                      }}
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              </details>
            ))}
          </nav>
          <div className="nav-account">
            {import.meta.env.DEV && (
              <label className="role-preview">
                <span>WORKSPACE PREVIEW</span>
                <select
                  aria-label="Preview role"
                  value={role}
                  onChange={(e) => {
                    navigate(`/${e.target.value}`);
                    setMobile(false);
                  }}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
            <Link
              className="icon-button"
              to="/login"
              title="View sign-in page"
              aria-label="View sign-in page"
            >
              <LogOut size={17} />
            </Link>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="portal-context">
          <Link to="/">University website</Link>
          <span>{admin ? "Administration" : "Student workspace"}</span>
          <Link to="/policies">Registration policies</Link>
        </div>
        <ConnectionStatus />
        <Outlet />
      </main>
      <footer>
        <span>{brand.name} · Student services</span>
        <Link to="/contact">Contact & support</Link>
      </footer>
    </div>
  );
}
