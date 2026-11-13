import { useEffect, useMemo, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigationType,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  FileText,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  programs,
  schools,
  schoolName,
  admissionLists,
} from "../data/university";
import {
  PublicHero,
  ProgramCard,
  SectionHeading,
  schoolIcons,
} from "../components/PublicUI";
import { Empty } from "../components/UI";
import { AcademicPlan, missingInformation } from "./CourseCatalog";
import curricula from "../data/publicCurricula.json";
export function Programs() {
  const [params, setParams] = useSearchParams();
  const pendingParams = useRef(new URLSearchParams(params));
  const location = useLocation(),
    navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP")
      pendingParams.current = new URLSearchParams(location.search);
  }, [location.key, location.search, navigationType]);
  const query = params.get("q") || "",
    school = params.get("school") || "",
    level = params.get("level") || "",
    sort = params.get("sort") || "name";
  // Navigation can defer its render. Merge with the latest requested filters
  // so rapid input cannot discard another control's value.
  const set = (key, value) => {
    const next = new URLSearchParams(pendingParams.current);
    if (value) next.set(key, value);
    else next.delete(key);
    pendingParams.current = next;
    setParams(next, { replace: true });
  };
  const clear = () => {
    pendingParams.current = new URLSearchParams();
    setParams({}, { replace: true });
  };
  const results = useMemo(
    () =>
      programs
        .filter(
          (p) =>
            (!school || p.school === school) &&
            (!level || p.level === level) &&
            `${p.name} ${schoolName(p.school)}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "credits"
            ? a.credits - b.credits || a.name.localeCompare(b.name)
            : a.name.localeCompare(b.name),
        ),
    [query, school, level, sort],
  );
  return (
    <>
      <PublicHero eyebrow="THE PROGRAM DIRECTORY" title="Find what moves you.">
        Explore areas of study by school and level. Contact admissions for
        availability and entry requirements.
      </PublicHero>
      <section className="public-section public-container directory-section">
        <div className="program-filters">
          <label className="program-search">
            <Search size={19} />
            <input
              aria-label="Search programs"
              value={query}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search a program or area of study"
            />
          </label>
          <label>
            <span>School</span>
            <select
              aria-label="Filter programs by school"
              value={school}
              onChange={(e) => set("school", e.target.value)}
            >
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short}
                </option>
              ))}
              <option value="freshman">Freshman Program</option>
            </select>
          </label>
          <label>
            <span>Study level</span>
            <select
              aria-label="Filter programs by level"
              value={level}
              onChange={(e) => set("level", e.target.value)}
            >
              <option value="">All levels</option>
              {["Undergraduate", "Graduate", "Diploma", "Foundation"].map(
                (l) => (
                  <option key={l}>{l}</option>
                ),
              )}
            </select>
          </label>
        </div>
        <div className="directory-results-bar">
          <span role="status">
            {results.length} {results.length === 1 ? "program" : "programs"}{" "}
            found
          </span>
          <div>
            <button className="filter-reset" onClick={clear}>
              Clear filters
            </button>
            <select
              aria-label="Sort programs"
              value={sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              <option value="name">Alphabetical</option>
              <option value="credits">Credit requirement</option>
            </select>
          </div>
        </div>
        <div className="program-grid">
          {results.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
        {!results.length && (
          <Empty text="No programs match your search. Try another keyword or clear your filters." />
        )}
      </section>
    </>
  );
}
export function ProgramDetail() {
  const { id } = useParams();
  const p = programs.find((item) => item.id === id);
  if (!p)
    return (
      <section className="public-section public-container">
        <h1>Program not found</h1>
        <p>This program is not available in the directory.</p>
        <Link className="button primary" to="/programs">
          Back to programs
        </Link>
      </section>
    );
  const Icon = schoolIcons[p.school];
  return (
    <>
      <section className="program-detail-hero">
        <div className="public-container">
          <Link className="breadcrumb" to="/programs">
            Programs / {schoolName(p.school)}
          </Link>
          <div className="detail-heading">
            <div>
              <div className="eyebrow">{p.level.toUpperCase()}</div>
              <h1>{p.name}</h1>
              <p>{schoolName(p.school)}</p>
            </div>
            <Icon size={80} strokeWidth={1} />
          </div>
          <div className="detail-facts">
            <div>
              <span>Credit requirements</span>
              <b>
                {p.credits == null
                  ? missingInformation
                  : `${p.school === "freshman" ? "Minimum " : ""}${p.credits} credits`}
              </b>
            </div>
            <div>
              <span>Study level</span>
              <b>{p.level}</b>
            </div>
          </div>
        </div>
      </section>
      <section className="public-section public-container program-detail-grid">
        <div>
          <SectionHeading
            eyebrow="EXPLORE THIS PATH"
            title="Your academic starting point."
          />
          <p className="detail-intro">
            {curricula[p.id]?.description || missingInformation}
          </p>
          <h2 className="detail-subheading">Academic plan</h2>
          <p>Degree: {curricula[p.id]?.degree || missingInformation}</p>
          <AcademicPlan programId={p.id} />
          <h2 className="detail-subheading">Preparing to apply</h2>
          <p>
            Organize your academic records and supporting documents.
            Requirements vary by study level and program.
          </p>
          <Link className="button secondary" to="/admissions">
            View application checklist
          </Link>
        </div>
        <aside className="detail-aside">
          <GraduationCap size={30} />
          <h2>Make your next step an informed one.</h2>
          <p>Explore the application process and plan for your studies.</p>
          <Link className="button primary full" to="/admissions">
            Admissions guide <ArrowRight size={15} />
          </Link>
          <Link className="button secondary full" to="/contact">
            Get in touch
          </Link>
          <Link className="underlined-link" to="/tuition">
            Tuition & fees
          </Link>
        </aside>
      </section>
    </>
  );
}
export function Schools() {
  return (
    <>
      <PublicHero
        eyebrow="SCHOOLS & ACADEMIC PATHWAYS"
        title="A place for your curiosity."
      >
        Explore schools and find an area of study that speaks to you.
      </PublicHero>
      <section className="public-section public-container">
        <div className="school-detail-grid">
          {schools.map((s) => {
            const Icon = schoolIcons[s.id];
            return (
              <article key={s.id}>
                <Icon size={32} />
                <h2>{s.name}</h2>
                <p>{s.description}</p>
                <Link
                  className="underlined-link"
                  to={"/programs?school=" + s.id}
                >
                  Explore programs <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
          <article className="foundation-school">
            <BookOpen size={32} />
            <h2>Freshman Program</h2>
            <p>
              Explore foundation pathways in Arts, Sciences and Engineering.
            </p>
            <Link className="underlined-link" to="/programs?school=freshman">
              Explore pathways <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
