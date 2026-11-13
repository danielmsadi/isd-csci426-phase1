# Frontend integration contract

This is a proposed frontend contract, not an implemented API. No Node.js backend or database has been created. Adapt these paths when the backend design is finalized.

## Connection and state

Set `VITE_API_BASE_URL` to the API base URL once available. It must be a public API URL, never a secret. The fetch adapter sends JSON or multipart FormData, uses credentials for a future cookie session, handles error responses and returns actual data only. Missing configuration rejects requests instead of simulating success.

Development portal loads call `GET /portal/student` or `GET /portal/admin`. Return an object with the keys defined in `src/data/emptyPortal.js`. Collections may be empty and object values may be null. Unknown data is represented as absent, not zero. Role selection in the browser must never authorize API access; the server must enforce its own session permissions and student scoping.

Collections use stable `id` values. Forms refer to record IDs. Common display fields:

- students/currentStudent: the same official account shape; name, email (university), personalEmail, dateOfBirth, gender, nationality, phone, address, emergencyContactName, emergencyContactPhone, majorId, majorName, schoolId, schoolName, enrollmentSemesterId, admissionDate, status, pendingMajorName and majorEffective. Student profile is read-only. Account ID is assigned by the service. See `management-update.md` for normalization and validation.
- majors: id, name, department, schoolId, schoolName (legacy school is accepted).
- courses: code, name, credits, department, prerequisiteIds.
- sections: courseId, courseCode, courseName, department, section, instructor, room, schedule, days, start, end, capacity, availableSeats, enrolledCount, prerequisites, status.
- enrollments: courseCode, courseName, credits, section, instructor, room, schedule.
- grades: studentId, studentName, courseCode, courseName, semester, credits, grade, total, gpa, published, status; assessments contain courseCode, name, weight, score, maximum.
- degreePlans: name, majorName, courseIds, requiredCredits; degreeRequirements: courseCode, courseName, credits, prerequisites, status.
- installments: studentId, number, label, dueDate, amount, penalty, balance, status.
- payments: studentId, studentName, receiptNumber, date, installmentNumber, amount, method, status.
- pricing: name, type, rate, effectiveSemester.
- requests: type (Aid/Major/Override), studentName, reason, submittedAt, decisionNote, status, documents (id/name).
- announcements: title, body.

`summary` supplies GPA, enrolledCredits, completedCredits, academicStanding, degreeProgress, balance, studentCount, sectionCount, pendingRequestCount and paymentsReceived where authorized. `finance` supplies tuition, aidAmount, paid, balance and hold. These are server-calculated values. During financial holds the server must omit grades, GPA and transcript access, not rely only on UI hiding.

`settings` contains semester, nextSemester, registrationStart, registrationEnd, dropDeadline, minCredits, maxCredits, installment1 through installment4. No browser clock override exists.

## Proposed mutation endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| /students, /students/:id | POST / PATCH | Create/update account; existing major changes become effective next semester |
| /students/:id/welcome | POST | Send an actual password setup link |
| /courses, /courses/:id | POST / PATCH | Catalog and prerequisite IDs |
| /majors | POST | Academic program |
| /degree-plans | POST | Required course IDs for a major |
| /sections, /sections/:id | POST / PATCH | Capacity, instructor, room and schedule |
| /settings/semester | PUT | Current calendar, credit rules and four due dates |
| /semesters, /semesters/:id | POST / PATCH | Create/edit semester with registration dates, credit bounds and four due dates |
| /enrollments | POST | Register by sectionId |
| /enrollments/:id | DELETE | Drop with server-validated full refund |
| /gradebooks/:sectionId | PUT | Versioned raw scores and section draft/publication state; see gradebook-integration.md |
| /payments/cash | POST | studentId, installmentId, amount, reference |
| /finance/student-controls | PATCH | studentId, registrationOverride boolean, reason (registration only) |
| /pricing/majors, /pricing/courses | PUT | majorId/courseId and per-credit rate |
| /requests/aid | POST multipart | requestedPercent, reason, documents |
| /requests/major | POST | majorId, reason |
| /requests/override | POST | courseId, exception, reason |
| /requests/:id/decision | PATCH | status, decisionNote; aidPercent required for Aid approval |
| /students/me/transcript | GET binary | Authorized official transcript |
| /payments/:id/receipt | GET binary | Authorized receipt |

Success must come from the server. On successful mutations the UI reloads portal state. Failures should return an HTTP error with `{ "message": "..." }`. Validation includes cross-record ownership, prerequisites, circular dependencies, schedule clashes and capacity. UI checks improve form feedback but are not authoritative.

## Authentication and future services

Login and password-reset forms expose proposed `/auth/login` and `/auth/password-reset` calls, but no authenticated session lifecycle is implemented. Password setup and the advisor are disabled pending actual token/service integration. There are no fake users, passwords, role claims or generated reset links. Implement authenticated bootstrap, session expiration, CSRF protection and server-verified roles, then replace the production redirect in `App.jsx` and enable authenticated loading in `PortalContext.jsx`. Remove the temporary preview UI when it is no longer needed.

The authentication backend must enforce university email policy and the maximum of two reset requests. Enrollment rules must prohibit repeated courses and waitlists, reject full sections, validate deadlines and apply full-refund drops. Billing must calculate four equal installments and one $20 late penalty per overdue installment; overdue balances restrict records and next-term registration. Admin registration overrides must not release academic records. Approved major changes must activate only next semester.

Real online payments, email delivery, AI services, file storage and database development are out of scope for this frontend update.
