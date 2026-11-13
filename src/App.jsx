import { Navigate, Route, Routes, Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import { Login, ForgotPassword, ResetPassword } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import Grades from "./pages/Grades";
import Degree from "./pages/Degree";
import Finance from "./pages/Finance";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import AdminStudents from "./pages/AdminStudents";
import { AdminCourses, AdminSections } from "./pages/AdminAcademics";
import AdminSettings from "./pages/AdminSettings";
import AdminGrades from "./pages/AdminGrades";
import PublicLayout, { RouteEffects } from "./components/PublicLayout";
import UniversityHome from "./pages/UniversityHome";
const Programs = lazy(() =>
  import("./pages/Programs").then((module) => ({ default: module.Programs })),
);
const ProgramDetail = lazy(() =>
  import("./pages/Programs").then((module) => ({
    default: module.ProgramDetail,
  })),
);
const Schools = lazy(() =>
  import("./pages/Programs").then((module) => ({ default: module.Schools })),
);
import {
  About,
  Admissions,
  Tuition,
  Campuses,
  Contact,
} from "./pages/UniversityInfo";
import { Sources, ProjectPolicies } from "./pages/Sources";
import Schedule from "./pages/Schedule";
const CourseCatalog = lazy(() => import("./pages/CourseCatalog"));
const academic = (page) => (
  <Suspense
    fallback={
      <section className="public-section public-container" role="status">
        Loading academic information…
      </section>
    }
  >
    {page}
  </Suspense>
);
function Protected() {
  // Preview bypass is compiled out of production. Replace with server-backed
  // session/role authorization when authentication is implemented.
  if (!import.meta.env.DEV) return <Navigate to="/login" replace />;
  return <Layout />;
}
export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<UniversityHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/schools" element={academic(<Schools />)} />
          <Route path="/programs" element={academic(<Programs />)} />
          <Route path="/programs/:id" element={academic(<ProgramDetail />)} />
          <Route path="/courses" element={academic(<CourseCatalog />)} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/tuition" element={<Tuition />} />
          <Route path="/campuses" element={<Campuses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/policies" element={<ProjectPolicies />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/student" element={<Protected role="student" />}>
          <Route index element={<Dashboard />} />
          <Route path="offerings" element={<Registration offerings />} />
          <Route path="registration" element={<Registration />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="grades" element={<Grades />} />
          <Route path="degree" element={<Degree />} />
          <Route path="finance" element={<Finance />} />
          <Route path="aid" element={<Applications type="Aid" />} />
          <Route path="major" element={<Applications type="Major" />} />
          <Route path="overrides" element={<Applications type="Override" />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/admin" element={<Protected role="admin" />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="sections" element={<AdminSections />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route
            path="overrides"
            element={<Applications admin type="Override" />}
          />
          <Route path="grade-management" element={<AdminGrades />} />
          <Route
            path="grades"
            element={<Navigate to="/admin/grade-management" replace />}
          />
          <Route
            path="assessments"
            element={<Navigate to="/admin/courses?view=assessments" replace />}
          />
          <Route
            path="gradebook"
            element={<Navigate to="/admin/grade-management" replace />}
          />
          <Route path="finance" element={<Finance admin />} />
          <Route path="requests" element={<Applications admin />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="auth-simple">
              <div className="card">
                <h1>Page not found</h1>
                <p>Let’s get you back to your portal.</p>
                <Link className="button primary" to="/">
                  Back to overview
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}
