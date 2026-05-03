<div align="center">
   <h1>Scholar Risk Detector — Taylor &amp; Francis</h1>
   <p><em>Editorial integrity platform for Taylor &amp; Francis editors</em></p>
</div>

This document is the canonical reference for the Scholar Risk Detector frontend. It covers product purpose, architecture, run & build instructions, configuration, development notes, and troubleshooting.

Table of contents
-----------------

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles & Workflows](#user-roles--workflows)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Running Locally](#running-locally)
- [Build & Deployment](#build--deployment)
- [Backend API Endpoints](#backend-api-endpoints)
- [Auth & Theme Usage (Dev Notes)](#auth--theme-usage-dev-notes)
- [Developer Experience & Tests](#developer-experience--tests)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Credits & License](#credits--license)

Overview
--------

Scholar Risk Detector helps Taylor &amp; Francis editors detect suspicious manuscripts early in the submission pipeline. It aggregates signals including content similarity, PDF metadata, authorship artifacts, and device fingerprints to produce a human-readable risk report for every submission.

Key Features
------------

- Multi-signal manuscript screening (content similarity, metadata, device fingerprints)
- Real-time PDF extraction and analysis
- Editor dashboard for rapid triage and decisioning
- Role-based UI (Author vs Editor)
- Persistent theme support (light / dark)
- Configurable backend integration via `VITE_BACKEND_URL`

User Roles & Workflows
----------------------

- Authors: Upload PDFs, view submission status and receive automated screening feedback.
- Editors: Access a prioritized review queue, inspect reports with signal breakdowns, and decide on manuscripts.

Typical flow:

1. Author uploads PDF through the Author Portal.
2. Frontend forwards the file to the backend (`/api/upload`).
3. Backend runs extraction, similarity checks, fingerprint analysis and returns a report.
4. Editors review flagged submissions in `/editor/dashboard` and act.

Architecture & Tech Stack
-------------------------

- Frontend: React + TypeScript, Vite builder
- Styling: Tailwind CSS utilities + global CSS variables
- Icons: lucide-react
- Auth & storage: Firebase (see `INTEGRATION_SUMMARY.md`)
- Backend: External API (configured through `VITE_BACKEND_URL`)

Folder Structure (important files)
---------------------------------

- `index.html` — HTML entry (title set to Scholar Risk Detector)
- `src/main.tsx` — React mount
- `src/App.tsx` — Routes & top-level providers (ThemeProvider, AuthProvider)
- `src/api.ts` — Backend base URL and API helpers
- `src/firebase.ts` — Firebase initialization
- `src/contexts/ThemeContext.tsx` — Theme provider + `useTheme()` hook
- `src/contexts/AuthContext.tsx` — Authentication provider
- `src/components/` — UI components (Landing, Login, Navbar, author/, editor/)
- `INTEGRATION_SUMMARY.md` — Backend and Firebase connection details

Installation
------------

Prerequisites:

- Node.js (LTS recommended)

Install dependencies:

```bash
npm install
```

Copy example env file if present:

```bash
cp .env.example .env.local
```

Configuration & Environment Variables
------------------------------------

Set these variables in `.env.local` (project root):

- `VITE_BACKEND_URL` — backend API base URL (defaults in code to `https://tnf-risk-detector-backend.onrender.com`)
- Firebase configuration values — consult `INTEGRATION_SUMMARY.md` for `projectId`, `authDomain`, `storageBucket`, etc.

Running Locally
---------------

Development server (hot reload):

```bash
npm run dev
```

Production build and preview:

```bash
npm run build
npm run preview
```

Build output is placed in `dist/` and suitable for static hosting.

Backend API Endpoints (expected)
--------------------------------

The frontend expects a backend providing these endpoints (adjust as needed):

- `POST /api/upload` — upload manuscript (multipart/form-data)
- `GET /api/submissions` — list submissions
- `GET /api/submissions/:id` — submission details
- `GET /api/submissions/:id/report` — risk report JSON
- `GET /api/stats` — site-wide statistics

Auth & Theme (developer notes)
-----------------------------

- `AuthContext` manages sign-in and roles. Demo editor credentials can be used in the UI for local testing: `editor@tnf.com / editor@123`.
- `ThemeContext` exposes `useTheme()` and persists theme in `localStorage` using key `scholar-risk-detector-theme`.

Example usage of theme hook:

```tsx
import { useTheme } from './contexts/ThemeContext';
export function ThemeToggle() {
   const { theme, toggleTheme } = useTheme();
   return <button onClick={toggleTheme}>Theme: {theme}</button>;
}
```

Developer Experience & Tests
---------------------------

- Type-checking: `npm run lint` (runs `tsc --noEmit`)
- Add unit/integration tests as needed; none included by default.

Troubleshooting
---------------

- Backend unreachable: verify `VITE_BACKEND_URL` in `.env.local` and backend CORS settings.
- Firebase issues: confirm Firebase config in `INTEGRATION_SUMMARY.md` and that the project accepts requests from the dev origin.
- Large bundle warnings: use dynamic imports or rollup manual chunks if needed.

Contributing
------------

1. Fork and create a topic branch.
2. Implement changes with types and any relevant tests.
3. Open a PR with testing instructions and screenshots for UI updates.

Credits & License
-----------------

- Built by Deepak for Taylor &amp; Francis editorial teams.
- Verify licensing with the project owner before external distribution.

Contact
-------

For questions, contact Deepak or open an issue in this repository.

Changelog (high level)
----------------------

- 2026-05-03: Rebranded copy to "Scholar Risk Detector"; added full README documentation.

If you want, I can additionally:

- Add a Postman collection and example `curl` snippets for backend endpoints
- Add a local mock backend to develop front-end features offline
- Expand the README with data models for the risk report JSON used by editor UI

