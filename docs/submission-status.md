# CSCI426 Phase 1 submission preparation

Prepared November 13, 2026.

## Repository and preservation

- Git inspection found no repository or nested `.git` directory in the supplied folder. Initialized a new `main` branch; no prior history was rewritten or fabricated.
- GitHub repository: https://github.com/danielmsadi/isd-csci426-phase1 (private). Public visibility requires the owner's explicit approval.
- Existing application pages, academic data, root saved-webpage assets and local backups were preserved. Backups, build output, dependencies, environment files, credentials and temporary files are excluded from Git.
- One targeted style correction allows long course-catalog degree-plan links to wrap within their cards on mobile. Business logic and production access behavior are unchanged.
- A pattern scan of the 131 initially staged paths found no credential-pattern matches. `.env.example` contains no secret. This is a bounded publication check, not a full security audit.

## Verification

- Dependencies were already installed; `npm ls --depth=0` succeeded, so no reinstall was needed.
- Production build passed. Vite reports a non-blocking warning for the approximately 602 kB uncompressed course-catalog JavaScript chunk.
- All 36 unit tests passed.
- All 20 existing browser tests passed (2.4 minutes, exit code 0) on the final run. The initial run also passed all cases but stalled during Windows-managed server shutdown; the final run used the same tests and configuration with the already running servers and server management disabled in a temporary config.
- `scripts/verify-deployment.mjs` checks production direct visits, refreshes, headings, horizontal overflow, browser exceptions and Student/Admin redirects at 1440px and 390px widths. It initially exposed the course-catalog overflow, which was corrected.
- Production smoke checks passed at both widths (exit code 0) against the local Vite preview and the live production URL. Live checks used fresh browser contexts without authentication cookies and verified direct visits, refreshes, layout and existing portal redirects.
- README screenshots are actual local frontend captures. They do not demonstrate a hosted deployment.

## Verified Vercel deployment

Live website: https://isd-csci426-phase1.vercel.app

Vercel project: `961scale/isd-csci426-phase1`. The authenticated CLI deployment reached `READY`, and the production alias was independently checked in desktop and mobile browsers on November 13, 2026. No Vercel login was needed to view the production alias. No backend or database changes were made.

Automatic GitHub deployments remain unconnected. Vercel returned: "You need to add a Login Connection to your GitHub account first." To enable automatic updates:

1. Open Vercel Account Settings → Authentication and connect the GitHub account `danielmsadi`.
2. Open the project's Settings → Git and connect `danielmsadi/isd-csci426-phase1`, granting repository access when prompted; alternatively run `npx vercel git connect` from this folder.
3. Until connected, publish changes with `npx vercel --prod`.

## Redeployment instructions

In PowerShell:

```powershell
cd "C:\Users\user\Downloads\ISD PROJECT_files"
npx vercel login
```

Accept installation if npm prompts, open the authorization URL displayed by the CLI, sign in to your Vercel account, and approve the device login. Return to the terminal and wait for confirmation. Never paste a token into the README or chat.

The CLI is now authorized. For future deployments, run:

```powershell
npx vercel --prod
```

Choose your account, create/link the `isd-csci426-phase1` project, use `./` as the project directory and accept the Vite settings from `vercel.json`. No environment variables are necessary. To enable automatic GitHub deployments, import the private repository in Vercel and authorize its GitHub integration for that repository.

Verify the actual production URL after deployment:

```powershell
node scripts/verify-deployment.mjs https://isd-csci426-phase1.vercel.app
```

This uses installed Microsoft Edge. Set `PLAYWRIGHT_CHANNEL=chrome` for installed Chrome. Confirm the URL is accessible to the assessor; account-only Vercel protection may require changing deployment access settings.

## Remaining submission actions

- Submit the production URL and GitHub repository URL with the course's required deliverables.
- Grant the assessor access to the private GitHub repository, or explicitly approve a visibility change before making it public.
- Demonstrate the full Student/Admin interfaces locally using `npm run dev`; production intentionally has no preview bypass. If the rubric requires remotely accessible Student/Admin screens, the current production behavior does not satisfy that requirement and needs a separately approved frontend demo-access change.
- Compare the submission with the actual CSCI426 Phase 1 rubric; no rubric was supplied, so additional report, diagram, team-information or presentation requirements have not been confirmed.

The production Student/Admin routes intentionally redirect to `/login`; authentication and persistence are unavailable. For assessment of the complete portal UI, use `npm run dev` and the preview links, alongside the README screenshots. No backend or database work was performed.

Official references: [Vercel login](https://vercel.com/docs/cli/login), [Vite deployment and SPA rewrites](https://vercel.com/docs/frameworks/frontend/vite).
