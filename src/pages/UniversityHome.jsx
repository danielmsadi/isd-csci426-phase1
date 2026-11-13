import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Globe2,
  Compass,
  GraduationCap,
  MapPin,
  MoveDown,
} from "lucide-react";
import { schools, programs } from "../data/university";
import {
  Photo,
  SectionHeading,
  ProgramCard,
  schoolIcons,
} from "../components/PublicUI";
import {
  AdmissionSteps,
  TuitionSummary,
  ContactDetails,
  FAQ,
} from "./UniversityInfo";
export default function UniversityHome() {
  const featured = [
    "arts-sciences-computer-science",
    "engineering-computer-engineering",
    "business-accounting",
  ].map((id) => programs.find((p) => p.id === id));
  return (
    <>
      <section className="discovery-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-line" /> KNOWLEDGE OPENS POSSIBILITIES
          </span>
          <h1>
            Your ambition.
            <br />
            Your journey.
            <br />
            <em>A world ahead.</em>
          </h1>
          <p>
            Explore your academic possibilities. Find a field that speaks to
            you, and a path to what comes next.
          </p>
          <div className="hero-buttons">
            <Link className="button primary" to="/programs">
              Find your program <ArrowRight size={17} />
            </Link>
            <Link className="hero-secondary" to="/admissions">
              Explore admissions <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="hero-seal">
              <GraduationCap size={22} />
            </span>
            <span>
              Education. Opportunity. Possibility.
              <small>Find your direction. Shape your future.</small>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <Photo eager />
          <span className="hero-image-label">
            A NEW PERSPECTIVE STARTS HERE
          </span>
          <div className="hero-image-card">
            <BookOpen size={23} />
            <span>
              Find where you belong.
              <small>Explore your academic direction.</small>
            </span>
            <ArrowUpRight size={18} />
          </div>
          <span className="vertical-note">LEARN WITH PURPOSE · LOOK AHEAD</span>
        </div>
      </section>
      <div className="discovery-strip">
        <span>
          <Compass size={19} /> Find your direction
        </span>
        <span>
          <BookOpen size={19} /> Explore the curriculum
        </span>
        <span>
          <Globe2 size={19} /> Discover university life
        </span>
        <a href="#about">
          Begin exploring <MoveDown size={14} />
        </a>
      </div>
      <section
        className="public-section public-container about-section"
        id="about"
      >
        <div>
          <span className="eyebrow">ABOUT US</span>
          <h2>
            Built around learning.
            <br />
            <em>Open to possibility.</em>
          </h2>
          <p>
            Bring your ambitions into focus. Explore academic pathways and the
            questions that will guide your next step.
          </p>
          <p>
            Explore schools and Freshman pathways, with undergraduate, graduate
            and teaching-diploma options.
          </p>
          <Link className="underlined-link" to="/about">
            Get to know us <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="about-visual">
          <Photo kind="library" />
          <span className="outline-word" aria-hidden="true">
            DISCOVER
          </span>
        </div>
      </section>
      <section className="why-section" id="why-liu">
        <div className="public-container">
          <SectionHeading
            eyebrow="WHY EXPLORE?"
            title="An education with purpose."
          >
            Start with what matters to you. Discover where your interests can
            lead.
          </SectionHeading>
          <div className="why-grid">
            {[
              [
                "01",
                "Access to learning",
                "Find a field that matches your interests and learning goals.",
                Compass,
              ],
              [
                "02",
                "Learning by doing",
                "Connect your curiosity with the skills you want to develop.",
                BookOpen,
              ],
              [
                "03",
                "Room to explore",
                "Explore business, engineering, arts and sciences, education, and pharmacy.",
                Globe2,
              ],
            ].map(([number, title, copy, Icon]) => (
              <article key={number}>
                <div>
                  <Icon size={25} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <Link to="/about">
                  Learn more <ArrowUpRight size={13} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="public-section public-container" id="schools">
        <SectionHeading
          eyebrow="OUR ACADEMIC LANDSCAPE"
          title="Different passions. Shared possibility."
          action={
            <Link className="underlined-link" to="/schools">
              Explore all schools <ArrowUpRight size={16} />
            </Link>
          }
        >
          Explore the schools and the fields they bring together.
        </SectionHeading>
        <div className="school-grid">
          {schools.map((s) => {
            const Icon = schoolIcons[s.id];
            return (
              <Link
                key={s.id}
                to={`/programs?school=${s.id}`}
                className={`school-card school-${s.id}`}
              >
                <span className="school-icon">
                  <Icon size={25} />
                </span>
                <h3>{s.short}</h3>
                <p>{s.disciplines}</p>
                <ArrowUpRight className="school-arrow" size={19} />
              </Link>
            );
          })}
        </div>
        <div className="freshman-banner">
          <span>
            <b>A foundation for what comes next.</b> Explore the Freshman Arts,
            Sciences and Engineering pathways.
          </span>
          <Link to="/programs?school=freshman">
            Freshman pathways <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="programs-feature" id="programs">
        <div className="public-container">
          <SectionHeading
            eyebrow="FIND YOUR PATH"
            title="Let curiosity lead the way."
            action={
              <Link className="underlined-link" to="/programs">
                Browse the program directory <ArrowUpRight size={16} />
              </Link>
            }
          >
            Search by school and study level. Find the academic direction that
            fits you.
          </SectionHeading>
          <div className="program-grid">
            {featured.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="public-section public-container" id="admissions">
        <SectionHeading
          eyebrow="YOUR NEXT STEP"
          title="A thoughtful start to your journey."
          action={
            <Link className="underlined-link" to="/admissions">
              Admission requirements <ArrowUpRight size={16} />
            </Link>
          }
        >
          Find your program, prepare your documents and confirm the requirements
          with admissions.
        </SectionHeading>
        <AdmissionSteps />
      </section>
      <section className="tuition-feature" id="tuition">
        <div className="public-container tuition-split">
          <div>
            <span className="eyebrow">PLAN WITH CLARITY</span>
            <h2>
              Understand the investment.
              <br />
              <em>Explore your options.</em>
            </h2>
            <p>
              Explore tuition, payment schedules and financial assistance to
              prepare for the cost of your education.
            </p>
            <Link className="button white" to="/tuition">
              View tuition & fees <ArrowRight size={16} />
            </Link>
          </div>
          <TuitionSummary />
        </div>
      </section>
      <section
        className="public-section public-container campus-feature"
        id="campuses"
      >
        <div className="campus-art-panel">
          <svg
            viewBox="0 0 300 360"
            role="img"
            aria-label="Original abstract illustration inspired by Lebanon's coastline, not a geographic map"
          >
            <path
              d="m181 20 51 51-17 43 22 46-31 51-8 64-56 65-38-30 19-70-15-34 38-61-10-55Z"
              fill="#d8e2d7"
              stroke="#9fb59f"
              strokeWidth="2"
            />
            <path
              d="m174 57-12 63 12 60-34 60-15 61"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeDasharray="6 7"
            />
            {[
              [173, 75],
              [153, 150],
              [177, 190],
              [140, 255],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="11" fill="#173c50" opacity=".12" />
                <circle cx={cx} cy={cy} r="4" fill="#173c50" />
              </g>
            ))}
          </svg>
          <span>CONNECTED THROUGH LEARNING</span>
        </div>
        <div>
          <span className="eyebrow">CAMPUSES & COMMUNITY</span>
          <h2>
            A place to begin.
            <br />
            <em>A community to discover.</em>
          </h2>
          <p>
            Find out about campus locations, program availability and the
            support you need to plan your studies.
          </p>

          <Link className="underlined-link" to="/campuses">
            Explore campus locations <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="faq-section" id="faq">
        <div className="public-container faq-layout">
          <div>
            <span className="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</span>
            <h2>
              A little clarity
              <br />
              goes a long way.
            </h2>
            <p>
              Start here, then confirm your individual requirements with
              admissions.
            </p>
          </div>
          <FAQ />
        </div>
      </section>
      <section
        className="public-section public-container contact-feature"
        id="contact"
      >
        <SectionHeading
          eyebrow="LET’S FIND YOUR NEXT STEP"
          title="Connect with the university."
        >
          Get guidance on admissions, current fees and student services.
        </SectionHeading>
        <ContactDetails />
        <Link className="underlined-link" to="/contact">
          Contact information & guidance <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
