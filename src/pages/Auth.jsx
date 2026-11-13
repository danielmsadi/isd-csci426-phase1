import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { ApiForm } from "../components/BackendUI";
import Brand from "../components/Brand";
import { brand } from "../data/brand";
const emailField = {
  name: "email",
  label: "University email",
  type: "email",
  autoComplete: "username",
};
export function Login() {
  return (
    <div className="auth-screen">
      <section className="auth-story">
        <Brand compact />
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>
            A world of knowledge.
            <br />
            <em>A future of possibilities.</em>
          </h1>
          <p>
            Your courses, your progress, your university.
            <br />
            Everything you need, in one place.
          </p>
          <div className="auth-features">
            <span>
              <BookOpen size={18} /> Learn with purpose
            </span>
            <span>
              <ShieldCheck size={18} /> Grow with confidence
            </span>
          </div>
        </div>
        <small>{brand.tagline}</small>
      </section>
      <section className="auth-form">
        <div className="eyebrow">{brand.name} · Student services</div>
        <h1>Welcome back.</h1>
        <div className="auth-project-note">
          <Link to="/">Explore the university website</Link>
        </div>
        <p>Sign in with your university account.</p>
        <div className="alert info">
          Authentication will be available when the university services are
          connected.
        </div>
        <ApiForm
          endpoint="/auth/login"
          submitLabel="Sign in"
          fields={[
            emailField,
            {
              name: "password",
              label: "Password",
              type: "password",
              autoComplete: "current-password",
            },
          ]}
        />
        <Link className="forgot" to="/forgot-password">
          Forgot password?
        </Link>
        {import.meta.env.DEV && (
          <div className="preview-entry">
            <b>Workspace preview</b>
            <p>Preview a workspace. Account services require sign-in.</p>
            <div className="button-row">
              <Link className="button secondary" to="/student">
                Preview Student
              </Link>
              <Link className="button secondary" to="/admin">
                Preview Admin
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
function AuthCard({ title, description, children }) {
  return (
    <div className="auth-simple">
      <div className="card">
        <Brand compact />

        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        <Link to="/login">← Back to sign in</Link>
      </div>
    </div>
  );
}
export function ForgotPassword() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your university email to request a reset link. A maximum of two requests per account will be enforced by the authentication service."
    >
      <ApiForm
        endpoint="/auth/password-reset"
        submitLabel="Request reset link"
        fields={[emailField]}
      />
    </AuthCard>
  );
}
export function ResetPassword() {
  return (
    <AuthCard
      title="Choose your password"
      description="Set up your account or reset your password using the link sent by the university."
    >
      <div className="alert info">
        Password setup and link verification require the authentication service.
      </div>
      <ApiForm
        endpoint="/auth/password-setup"
        submitLabel="Save password"
        disabled
        fields={[
          {
            name: "password",
            label: "New password",
            type: "password",
            minLength: 8,
            autoComplete: "new-password",
          },
          {
            name: "confirmation",
            label: "Confirm password",
            type: "password",
            minLength: 8,
            autoComplete: "new-password",
          },
        ]}
        validate={(values) =>
          values.password !== values.confirmation
            ? "Passwords do not match."
            : null
        }
      />
    </AuthCard>
  );
}
