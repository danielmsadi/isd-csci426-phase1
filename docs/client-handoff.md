# Current handoff — 12 November 2026

This supersedes the earlier neutral-brand/withheld-content pass. The latest user instructions retain LIU branding and verified academic information.

## Branding and interface
- `src/data/brand.js` defaults to LIU, with the existing original custom shield. Name, short name, tagline, authorized logo, admission email and phone remain configurable with the corresponding VITE_* environment variables.
- No official logo or endorsement claim is introduced. Public footer describes an independent university guide.
- Project/developer labels, citations, verification dates and research warnings are absent from visible pages.
- Existing routes remain. /sources redirects to /about. New local routes: /courses, /admin/assessments and /admin/gradebook.

## Local academic coverage
Use `academic-completeness.md` for the exact program matrix. Five schools, 65 program entries, three Freshman pathways and the previously verified tuition/admission/campus information remain visible. Runtime curriculum data contains 2,069 program-course entries (977 distinct course codes) and 53 reconciled semester plans. This is not a claim that every syllabus description is complete; 37 concise course descriptions are available and the rest use an explicit unavailable state.

## Frontend limits
Student and admin records remain empty. No backend/database was written or modified. Existing API adapter and integration paths remain. New frontend request contracts are documented in `gradebook-integration.md`. Save, authentication, payment, email and publication success require real services. All locally edited definitions/scores are transient; no records are fabricated or persisted in browser storage.

For the presentation use `npm run dev`. Production intentionally has no preview role switch or auth bypass.

## External navigation audit
Public academic/navigation links stay inside React Router. No HTTP(S) source/PDF/application redirects remain. Verified mailto:/tel: contact actions remain for LIU admissions and campuses. External assets remain: two illustrative Unsplash images and Google Fonts (fonts.googleapis.com / fonts.gstatic.com). Original SVG fallback remains if photography fails. A future configured remote logo would add an asset request.

## Data review and source provenance
Research is internal only: `public-sources.md`, `research-programs.json`, `research-university.js.txt`, `academic-document-audit.json`, `curriculum-extraction-review.json` and `course-description-summaries.json`. Existing 193 PDF documents were audited; no new research was needed for the final presentation pass.

Public tuition fees are separate from the registration application's four-installment/$20 finance rules. Dates, eligibility, actual records and authorized GPA totals must remain server-enforced. No academic policy from the original specification was silently replaced by the public tuition schedule.
