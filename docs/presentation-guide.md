# Five-minute presentation — 12 November 2026

## Before presenting

Run `npm run dev` from the existing project and open `http://localhost:5173`. Keep the dev server open. Production preview intentionally redirects portal routes to sign-in because real authentication is not implemented. No credentials are needed for the development workspace selector.

## 0:00–1:00 — Public website

Show the homepage, premium navy/white styling, top dropdown navigation and responsive layout. Open Programs, search Computer Science and show its 99-credit requirement. Explain that all academic information is local frontend data sourced from official university materials; the implementation does not claim official university endorsement.

## 1:00–2:00 — Academic information

Open Computer Engineering and expand its first semester: its seven term totals reconcile to 108 credits. Click a course to open the internal searchable course catalog. Show tuition per credit and the subject-to-change note. Mention the explicit unavailable state wherever an academic detail could not be verified; do not describe every syllabus as complete.

## 2:00–3:00 — Student services

Choose Student portal → Preview Student. Visit registration, schedule, grades and tuition. Explain the empty states: the system has no invented students, grades or payments. Explain that published records appear here once connected, and overdue financial holds block grades, GPA and transcripts. Do not claim a live payment or registration was processed.

## 3:00–4:00 — Admin assessments

Switch workspace to Admin → Academics → Grade Management → Assessments. Add Test 1 (20%), Midterm (30%) and Final (50%). Show the total reaching 100%, then temporarily change a weight to show validation. You can edit/remove these transient definitions, but assigning/saving requires a real course and connected service. No test definitions persist on refresh.

## 4:00–5:00 — Gradebook and integrity

Open the Gradebook tab, then Publication. Point out Semester → Course → Section selection and the empty registered-student roster. Explain weighted scoring (score / maximum × weight), configurable letter/GPA thresholds, incomplete-score handling, draft saving and confirmation before publication. Mention that calculations and publication/hold guards are covered by tests. Finish by emphasizing the frontend is ready for integration; saves, emails and payments do not falsely report success.

## Presentation limits

- No real authenticated session or persistence is available; development workspace access is temporary and does not authorize backend access.
- Populated Gradebook entry/publication cannot be demonstrated with real students until actual records are supplied. No fake records were added for the presentation.
- Some detailed descriptions and 12 semester plans remain unavailable. Full program coverage is recorded in `academic-completeness.md`.
- No backend or database was created or modified. Existing integration points remain, with Gradebook request shapes documented separately.
