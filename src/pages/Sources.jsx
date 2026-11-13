import { Navigate } from "react-router-dom";
import { projectPolicies } from "../data/university";
import { PublicHero } from "../components/PublicUI";
// Retain the previous route for existing bookmarks; research lives in docs only.
export function Sources() {
  return <Navigate to="/about" replace />;
}
export function ProjectPolicies() {
  return (
    <>
      <PublicHero
        eyebrow="REGISTRATION & STUDENT SERVICES"
        title="Your policies, clearly explained."
      >
        These are portal-specific registration and payment rules, separate from
        LIU’s published tuition and fee schedule.
      </PublicHero>
      <section className="public-section public-container">
        <div className="policy-directory">
          {projectPolicies.map(([title, body], i) => (
            <article key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
