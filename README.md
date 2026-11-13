# ISD — University Registration Portal

**Daniel Msadi · CSCI426 · Phase 1**

ISD is a React frontend for a university registration system inspired by LIU.
It brings together a public university guide and separate Student and Admin interfaces.

**Live website:** [isd-csci426-phase1.vercel.app](https://isd-csci426-phase1.vercel.app)

## Main Features

### Student

- Dashboard, course offerings and registration interface
- Class schedule, grades and degree progress
- Finance overview, financial aid and academic requests
- Student profile

### Admin

- Student account, course and section management
- Assessment setup and grade management
- Academic calendar and semester settings
- Finance, payments, financial aid and request management

The public website also includes programs, course information, admissions and tuition.
Layouts support desktop and mobile screens.

## Technologies

React, Vite, JavaScript, React Router, CSS and Lucide React icons.

## Run Locally

Install Node.js and npm, then open a terminal in the project folder:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, usually `http://localhost:5173`.
Choose **Student portal**, then **Preview Student** or **Preview Admin** to explore the interfaces.

## Phase 1 Scope

This phase covers the frontend. Authentication, database storage and payments are not connected.
Forms do not save records. On the live site, Student/Admin routes lead to sign-in; use the local previews to demonstrate those interfaces.

## UI Screenshots

![Public homepage — desktop](docs/screenshots/public-desktop.png)
![Public homepage — mobile](docs/screenshots/public-mobile.png)
![Student dashboard](docs/screenshots/student-dashboard.png)
![Admin finance — mobile](docs/screenshots/admin-finance-mobile.png)
