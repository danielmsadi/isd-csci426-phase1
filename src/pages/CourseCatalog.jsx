import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicHero } from "../components/PublicUI";
import { Empty } from "../components/UI";
import curricula from "../data/publicCurricula.json";
import { programs } from "../data/university";
export const missingInformation = "Information not yet available";
export function CurriculumTable({ courses = [], programId }) {
  return courses.length ? (
    <div className="official-table-wrap">
      <table className="official-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Course</th>
            <th>Credits</th>
            <th>Requirement group</th>
            <th>Prerequisites</th>
            <th>Corequisites</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={`${c.code}/${i}`}>
              <th scope="row">{c.code || "Elective"}</th>
              <td>
                {c.code ? (
                  <Link
                    to={`/courses?program=${encodeURIComponent(programId)}&q=${encodeURIComponent(c.code)}`}
                  >
                    {c.name}
                  </Link>
                ) : (
                  c.name
                )}
              </td>
              <td>{c.credits ?? missingInformation}</td>
              <td>{c.category || "Information not yet available"}</td>
              <td>
                {c.prerequisites === null
                  ? missingInformation
                  : c.prerequisites || "None listed"}
              </td>
              <td>
                {c.corequisites === null
                  ? missingInformation
                  : c.corequisites || "None listed"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty text={missingInformation} />
  );
}
export function AcademicPlan({ programId }) {
  const curriculum = curricula[programId];
  return (
    <>
      <h2 className="detail-subheading">
        Curriculum courses & elective options
      </h2>
      <p>
        Elective options are alternatives; they are not additional required
        credits.
      </p>
      <CurriculumTable courses={curriculum?.courses} programId={programId} />
      <h2 className="detail-subheading">Semester plan</h2>
      {curriculum?.plan?.length ? (
        curriculum.plan.map((term, i) => (
          <details className="curriculum-term" key={i}>
            <summary>
              {term.year} · {term.semester}
              <span>{term.totalCredits} credits</span>
            </summary>
            <CurriculumTable courses={term.courses} programId={programId} />
          </details>
        ))
      ) : (
        <Empty text={missingInformation} />
      )}
    </>
  );
}
export default function CourseCatalog() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const query = params.get("q") || "",
    program = params.get("program") || "";
  const rows = useMemo(
    () =>
      Object.entries(curricula)
        .flatMap(([programId, c]) =>
          (c.courses || [])
            .filter((c) => c.code)
            .map((course) => ({ ...course, programId })),
        )
        .filter(
          (c) =>
            (!program || c.programId === program) &&
            `${c.code} ${c.name}`.toLowerCase().includes(query.toLowerCase()),
        ),
    [query, program],
  );
  function update(key, value) {
    setPage(1);
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <>
      <PublicHero
        eyebrow="ACADEMIC CATALOG"
        title="Explore the courses behind your degree."
      >
        Browse course details and curriculum requirements by program.
      </PublicHero>
      <section className="public-section public-container">
        <div className="program-filters">
          <label className="program-search">
            <input
              aria-label="Search academic courses"
              value={query}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search by course code or name"
            />
          </label>
          <label>
            <span>Program</span>
            <select
              aria-label="Filter academic courses by program"
              value={program}
              onChange={(e) => update("program", e.target.value)}
            >
              <option value="">All programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status">{rows.length} course entries</p>
        {rows.length ? (
          rows
            .slice(
              (Math.min(page, Math.max(1, Math.ceil(rows.length / 25))) - 1) *
                25,
              Math.min(page, Math.max(1, Math.ceil(rows.length / 25))) * 25,
            )
            .map((c, i) => (
              <article
                className="course-description-card"
                key={`${c.programId}/${c.code}/${i}`}
              >
                <span className="eyebrow">
                  {c.code} · {c.credits} credits
                </span>
                <h2>{c.name}</h2>
                <p>{c.description || missingInformation}</p>
                <dl>
                  <dt>Prerequisites</dt>
                  <dd>
                    {c.prerequisites === null
                      ? missingInformation
                      : c.prerequisites || "None listed"}
                  </dd>
                  <dt>Corequisites</dt>
                  <dd>
                    {c.corequisites === null
                      ? missingInformation
                      : c.corequisites || "None listed"}
                  </dd>
                </dl>
                <Link
                  className="underlined-link"
                  to={`/programs/${c.programId}`}
                >
                  {programs.find((p) => p.id === c.programId)?.name} · View
                  degree plan
                </Link>
              </article>
            ))
        ) : (
          <Empty text={missingInformation} />
        )}
        {rows.length > 25 && (
          <div className="table-pagination">
            <button
              className="button secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous courses
            </button>
            <span>
              Page {Math.min(page, Math.ceil(rows.length / 25))} of{" "}
              {Math.ceil(rows.length / 25)}
            </span>
            <button
              className="button secondary"
              disabled={page >= Math.ceil(rows.length / 25)}
              onClick={() => setPage(page + 1)}
            >
              Next courses
            </button>
          </div>
        )}
      </section>
    </>
  );
}
