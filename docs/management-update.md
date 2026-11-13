# Presentation workflow update — 2026-11-12

## Recovery and scope

Pre-edit code, tests, research, scripts and configuration are archived in `backups/frontend-20261112-132330.zip`. Restore into a separate directory first if comparison or recovery is needed. Dependencies and generated build output are excluded.

The update is frontend-only. The existing API adapter, verified academic catalogs, university prices and source documentation remain unchanged. No sample student, grade, enrollment or payment data was added. No backend, database, email or payment processing was implemented.

## Workflows

- Admin student creation/editing uses `studentFields.js`: Personal, Contact and Academic Information. Existing `name`, `email`, `phone`, `address`, `majorId` and `status` keys are retained. `email` remains the university email. No second profile record is created. Profile is a read-only view of the same student shape; when the directory and current-student response reference the same ID, normalization reuses the directory object.
- Student ID is read-only, assigned by the future service, and excluded from create/update bodies. Added fields: `dateOfBirth`, `gender`, `nationality`, `personalEmail`, `emergencyContactName`, `emergencyContactPhone`, `schoolId`, `enrollmentSemesterId`, `admissionDate`. Majors must provide `schoolId`/`schoolName` (or legacy `school`); semesters provide `id`/`name`. Major-school mismatches and impossible birth/admission ordering are rejected. Major-change timing remains next semester.
- `/admin/grade-management` uses one selected-assessment score table with draft saving, independent assessment publication and calculated final results. Course management owns assessment configuration. Old grade routes redirect to the unified screen; the assessments route opens course configuration. Blank scores remain incomplete. See `gradebook-integration.md`.
- Student grades expose only published results, a semester filter, credit-weighted semester GPA, service-provided cumulative GPA/completed credits and a selected course breakdown. A missing/incomplete GPA input is not treated as zero. The service must provide summaries based only on published authorized results.
- `/admin/settings` retains its route and now has Semester Management and Calendar Overview. `POST /semesters` creates, `PATCH /semesters/:id` edits, and existing current settings retain `PUT /settings/semester`. Each record contains `semester` (displayed `name` is accepted for reads), registration dates, drop deadline, credit bounds and four ordered installment due dates. Timeline uses saved dates only; unsaved forms do not manufacture calendar records.
- `/admin/finance` has three forms: Course Credit Pricing, Record Cash Payment and Financial Aid. Payments and aid share one student/semester selector. Installments and receipts remain available in a disclosure; registration overrides are a compact student-account action. See `finance-forms.md`.

## Finance integration details

Selected Admin account totals are read from `student.finance` or a matching `finance.studentId` object; no identity/contact information is copied to a second record. Student portal still consumes its scoped `finance` object. Summary fields: tuition, aidAmount, paid, balance, penalties, hold, registrationOverride.

Installments use existing `studentId`, `number`, `amount`, `dueDate`, `penalty`, `status`. For precise settlement, `balance` is outstanding tuition and `penaltyBalance` is outstanding assessed late fees; account `finance.balance` is the combined outstanding total. Do not double-count penalty balances when adapting legacy APIs. The service generates four equal installments and assesses $20 only once per late installment. The frontend displays records and never fabricates invoices or penalties.

Overdue positive tuition/penalty balances restrict records and next-semester registration. `registrationOverride: true` lifts only the registration restriction. After settlement, return updated balances and `hold: false`; an explicit service hold remains authoritative until refreshed. The service must enforce academic-record restrictions, hide protected data and authorize all overrides, including reason/audit logging. Frontend checks do not replace authorization.

Cash payments retain `POST /payments/cash`, with studentId, installmentId, amount, reference and `method: "Cash"`. Payment validation checks ownership, positivity and outstanding amounts. Confirmation shows the submitted values; no success is displayed without a successful service response. Receipts retain their existing download endpoint.

Aid decisions use `PATCH /requests/:id/decision`: status, decisionNote, aidPercent. Approval requires a percentage greater than zero and at most 100; rejection grants zero. Holds use the existing `PATCH /finance/student-controls` with studentId, registrationOverride and a required reason. Aid controls are separated from hold controls.

## Tuition and limits

Existing verified rates are presented in separate undergraduate and graduate tables with USD per credit, program-specific exceptions, original fee currencies and a credits-times-rate explanation. Unknown rates say “Information unavailable”; no unsupported “Not applicable” labels or exchange conversions were introduced. Portal installment/$20 rules are explicitly separate from LIU's published fees.

Authentication, persistence, real student records, cash receipts, aid approval effects, installment generation and automatic settlement updates remain integration work. Development workspace preview is available via `npm run dev`; production retains its sign-in guard. Public academic completeness and external asset dependencies are unchanged.

## Verification

### Student-specific Financial Holds refinement

Financial Holds requires explicit selection from the existing student directory. Search matches name or Student ID; typing a new search clears the selected account and unmounts unsaved override forms/confirmations. No restrictions or override controls render before selection. The selected account shows name, ID, major and overdue balance including outstanding late fees.

`selectedStudentFinance` scopes installment/payment records to the selected existing ID. It rejects a nested finance object with mismatched ownership and never falls back to another student's global summary. Overdue balance uses the account's `overdueBalance` when supplied, otherwise sums only that student's overdue tuition and penalty balances when all required amounts/dates are available. Missing amounts remain unavailable. No records or amounts are fabricated.

`registrationOverridePayload` sends exactly `studentId`, `registrationOverride` and a trimmed reason of at least 10 characters to the existing endpoint. Confirmation identifies the target by name and ID. No bulk targets, aid changes or academic-record release fields are allowed. No local financial records are mutated; the service remains responsible for authorization and applying a successful request only to that student.

The light theme uses warm gray #F4F5F7, off-white #FAFAFC surfaces and muted #344B70 buttons. Large navy feature sections, footer, navigation and sign-in panel are now light. Existing layouts, academic catalogs and backend adapter were preserved. Checked shared text/button palette pairs exceed 4.5:1 contrast; desktop and mobile visual checks cover public, Student, Admin, program and sign-in screens.

- Production build passed (Vite 6.4.5). The pre-existing lazy-loaded academic catalog still triggers a nonblocking 500 kB chunk advisory.
- 28 Node unit tests passed, including grade weights/rounding, published-only filtering, credit-weighted semester GPA, canonical student references, date ordering, payment ownership, selected-account isolation, search, required override reasons and financial-hold/override behavior.
- 20 Microsoft Edge browser tests passed, including all public program details, Student/Admin routes, legacy redirects, profile/form grouping, tab state retention, calendar validation, empty finance guards, mobile layouts and production authentication guards.
- Binary comparison against the backup confirmed `src/data/api.js`, `publicCurricula.json`, `publicPrograms.json` and `university.js` unchanged.
- No real-record persistence or backend integration was claimed or tested. Arithmetic tests use isolated test inputs, not application seed data.
