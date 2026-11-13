import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { PublicHero, SectionHeading, Photo } from "../components/PublicUI";
import { Empty } from "../components/UI";
import {
  admissionLists,
  tuitionRows,
  universityFees,
  campuses,
} from "../data/university";
import { brand } from "../data/brand";

export function About() {
  return (
    <>
      <PublicHero eyebrow="ABOUT US" title="Knowledge begins with possibility.">
        Explore your interests, discover academic pathways and plan your next
        chapter.
      </PublicHero>
      <section className="public-section public-container about-section">
        <div>
          <SectionHeading
            eyebrow="A PLACE TO BEGIN"
            title="Your ambitions. Your direction."
          />
          <p>
            Lebanese International University began as Bekaa University in 2001
            and adopted the LIU name in 2005. It is a private, nonprofit
            institution.
          </p>
          <p>
            LIU brings together five schools and a Freshman Program, with
            undergraduate, graduate and teaching-diploma pathways.
          </p>
          <Link className="button primary" to="/schools">
            Explore the schools <ArrowRight size={16} />
          </Link>
        </div>
        <Photo kind="library" />
      </section>
    </>
  );
}
export function AdmissionSteps() {
  return (
    <div className="admission-steps">
      {[
        [
          "01",
          "Explore your program",
          "Compare areas of study and prepare questions about your chosen path.",
        ],
        [
          "02",
          "Prepare your documents",
          "Use the application checklist to organize your documents.",
        ],
        [
          "03",
          "Connect with admissions",
          "Confirm entry requirements and the next available intake.",
        ],
      ].map(([n, title, copy]) => (
        <article key={n}>
          <span>{n}</span>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>
      ))}
    </div>
  );
}
export function Admissions() {
  const [type, setType] = useState("Undergraduate"),
    [checked, setChecked] = useState({});
  return (
    <>
      <PublicHero eyebrow="ADMISSIONS" title="Your next chapter starts here.">
        Find your path and prepare for the application process.
      </PublicHero>
      <section className="public-section public-container">
        <AdmissionSteps />
        <div className="admissions-grid">
          <div>
            <SectionHeading
              eyebrow="PREPARE YOUR APPLICATION"
              title="Bring your plans into focus."
            />
            <div
              className="public-tabs"
              role="group"
              aria-label="Applicant type"
            >
              {Object.keys(admissionLists).map((t) => (
                <button
                  key={t}
                  aria-pressed={type === t}
                  className={type === t ? "selected" : ""}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="admission-checklist">
              {admissionLists[type].map((item, i) => (
                <label key={type + i}>
                  <input
                    type="checkbox"
                    checked={!!checked[type + i]}
                    onChange={(e) =>
                      setChecked({ ...checked, [type + i]: e.target.checked })
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <p className="quiet-caption">
              Your checklist is kept only while this page is open. Confirm
              required documents and entry criteria with admissions before
              applying.
            </p>
          </div>
          <aside className="detail-aside">
            <h2>Ready for the next step?</h2>
            <p>
              Contact admissions for program availability, application dates and
              individual entry requirements.
            </p>
            <Link className="button primary full" to="/contact">
              Contact admissions
            </Link>
            <Link className="button secondary full" to="/programs">
              Explore programs
            </Link>
            <Link className="underlined-link" to="/tuition">
              Tuition & financial planning
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
export function TuitionSummary() {
  return (
    <div className="tuition-summary">
      <span className="eyebrow">FINANCIAL PLANNING</span>
      <h3>Understand the cost of your education.</h3>
      <p>
        Tuition is calculated per credit, with additional registration and
        university fees. Rates are subject to change.
      </p>
      <Link className="underlined-link" to="/contact">
        Ask about tuition <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function Tuition() {
  return (
    <>
      <PublicHero
        eyebrow="TUITION & FINANCIAL PLANNING"
        title="Plan your education with clarity."
      >
        Find guidance on tuition, fees and payment arrangements.
      </PublicHero>
      <section className="public-section public-container">
        <SectionHeading
          eyebrow="TUITION PER CREDIT"
          title="Your tuition guide."
        >
          Rates are in USD per credit and are subject to change without notice.
          Confirm your applicable charges before payment.
        </SectionHeading>
        <div className="information-panel tuition-calculation">
          <h2>How tuition is calculated</h2>
          <p>
            Course tuition = registered credit hours × the applicable USD rate
            per credit. Add the applicable university fees, then subtract
            confirmed financial aid. Where rates differ by program, calculate
            each course at its applicable rate.
          </p>
          <p>
            Program-specific rates take precedence over a general school rate.
            Additional fees retain their published currencies; no exchange rate
            is assumed.
          </p>
        </div>
        {[
          ["undergraduate", "Undergraduate tuition"],
          ["graduate", "Graduate tuition"],
        ].map(([level, title]) => (
          <section className="tuition-level" key={level} aria-label={title}>
            <h2>{title}</h2>
            <div className="official-table-wrap">
              <table className="official-table">
                <thead>
                  <tr>
                    <th>School / program</th>
                    <th>USD per credit</th>
                  </tr>
                </thead>
                <tbody>
                  {tuitionRows
                    .filter((row) =>
                      level === "undergraduate"
                        ? !row.name.startsWith("MS in")
                        : row.name !== "Freshman",
                    )
                    .map((row) => (
                      <tr key={row.name}>
                        <th scope="row">{row.name}</th>
                        <td>
                          {row[level] == null
                            ? "Information unavailable"
                            : `$${row[level]}`}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <div className="public-two-column">
          <div>
            <h2>Additional fees</h2>
            <div className="fee-list">
              {universityFees.map(([name, price]) => (
                <div key={name}>
                  <span>{name}</span>
                  <span>{price}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="information-panel">
              <h2>Financial assistance</h2>
              <p>
                Financial aid applications are reviewed through the business
                office. Awards depend on financial circumstances; Pharmacy
                students are excluded from this aid scheme.
              </p>
              <Link className="underlined-link" to="/contact">
                Ask about financial aid <ArrowRight size={16} />
              </Link>
            </div>
            <div className="project-policy-callout">
              <span>PAYMENT ARRANGEMENTS</span>
              <h3>Keep track of your tuition.</h3>
              <p>
                The portal’s four-installment schedule and $20 one-time
                late-installment rule are separate system policies. They are not
                LIU’s published tuition or fee schedule shown above. Your
                account displays confirmed charges when available.
              </p>
              <Link to="/policies">
                Portal payment policies <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function Campuses() {
  const [region, setRegion] = useState("All locations");
  const locations = campuses.filter(
    (c) =>
      region === "All locations" ||
      (region === "Lebanon"
        ? c.country === "Lebanon"
        : c.country !== "Lebanon"),
  );
  return (
    <>
      <PublicHero
        eyebrow="CAMPUSES & COMMUNITY"
        title="Discover your place to begin."
      >
        Explore LIU campus locations. Contact admissions to confirm availability
        for your chosen program.
      </PublicHero>
      <section className="public-section public-container">
        <div className="public-tabs" role="group" aria-label="Campus region">
          {["All locations", "Lebanon", "International"].map((r) => (
            <button
              key={r}
              aria-pressed={region === r}
              className={region === r ? "selected" : ""}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="campus-directory">
          {locations.map((c) => (
            <article key={c.country + c.name}>
              <span className="eyebrow">{c.country}</span>
              <MapPin size={24} />
              <h2>{c.name}</h2>
              <p>{c.address || "Information not yet available"}</p>
              {c.phone ? (
                <a href={"tel:" + c.phone.replace(/[^+\d]/g, "")}>{c.phone}</a>
              ) : (
                <p>Information not yet available</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
export function ContactDetails() {
  return (
    <div className="contact-details">
      {brand.admissionsEmail ? (
        <a href={"mailto:" + brand.admissionsEmail}>
          <Mail size={23} />
          <span>
            <small>ADMISSIONS</small>
            <b>{brand.admissionsEmail}</b>
          </span>
        </a>
      ) : (
        <Link to="/admissions">
          <Mail size={23} />
          <span>
            <small>ADMISSIONS</small>
            <b>Prepare your application</b>
          </span>
          <ArrowRight size={16} />
        </Link>
      )}
      {brand.phone ? (
        <a href={"tel:" + brand.phone.replace(/[^+\d]/g, "")}>
          <Phone size={23} />
          <span>
            <small>CONTACT</small>
            <b>{brand.phone}</b>
          </span>
        </a>
      ) : (
        <Link to="/login">
          <Phone size={23} />
          <span>
            <small>STUDENT SERVICES</small>
            <b>Access your portal</b>
          </span>
          <ArrowRight size={16} />
        </Link>
      )}
      <Link to="/campuses">
        <MapPin size={23} />
        <span>
          <small>CAMPUS INFORMATION</small>
          <b>Explore locations</b>
        </span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function Contact() {
  return (
    <>
      <PublicHero
        eyebrow="CONTACT & GUIDANCE"
        title="Let’s find your next step."
      >
        Find guidance for applications, academic planning and student services.
      </PublicHero>
      <section className="public-section public-container">
        <ContactDetails />
        {!brand.admissionsEmail && !brand.phone && (
          <div className="information-panel">
            <h2>Contact details</h2>
            <p>
              University contact details are not yet available. Please check
              back for admissions and support information.
            </p>
          </div>
        )}
        <div className="public-two-column">
          <div className="information-panel">
            <h2>Planning your application?</h2>
            <p>
              Explore programs and prepare your documents before starting your
              application.
            </p>
            <Link className="underlined-link" to="/admissions">
              Admissions guide <ArrowRight size={16} />
            </Link>
          </div>
          <div className="information-panel">
            <h2>Already a student?</h2>
            <p>
              View your courses, account and academic records through student
              services.
            </p>
            <Link className="underlined-link" to="/login">
              Student portal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
export function FAQ() {
  return (
    <div className="faq-list">
      {[
        [
          "How do I explore programs?",
          <>
            Search the <Link to="/programs">program directory</Link> by school
            or study level.
          </>,
        ],
        [
          "Where can I find degree requirements?",
          <>
            Open a program’s detail page. Contact admissions for the academic
            plan and requirements that apply to your intake.
          </>,
        ],
        [
          "Where can I check tuition?",
          <>
            See the <Link to="/tuition">tuition guide</Link>. Confirm your
            applicable rates before making a payment.
          </>,
        ],
        [
          "How do I prepare my application?",
          <>
            Use the <Link to="/admissions">admissions checklist</Link> to
            organize your documents.
          </>,
        ],
        [
          "Where are my courses and account details?",
          <>
            Access the <Link to="/login">student portal</Link> for registration,
            academic records and financial services.
          </>,
        ],
      ].map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <div>{a}</div>
        </details>
      ))}
    </div>
  );
}
