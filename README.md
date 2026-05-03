# TNF Vibe Coding Challenge — Project README

## How to login

Use the demo editor credentials below to log in as an author/editor. The app provides a direct editor login.

- Demo Editor: **editor@tnf.com** / **editor@123**

Example login button (UI text):


---

## Project Overview

This repository contains a simple submission/review application split into two parts:

- `backend/` — Python backend that handles uploads, metadata extraction, user records, and risk scoring.
- `frontend/` — TypeScript + React (Vite) frontend that provides the UI for login, uploading, reviewing, and reporting.

Both parts are intended to be run locally for development.

## Repository Structure

- backend/
  - `main.py` — Application entry for the backend server.
  - `database.py` — Simple JSON-backed storage helpers.
  - `metadata_extractor.py` — Extracts metadata from uploaded documents.
  - `risk_scoring.py` — Risk / similarity scoring utilities.
  - `users.py` — User management and auth helpers.
  - `submissions_db.json` — Example storage for submissions.
  - `uploads/` — Example uploaded files.
  - `requirements.txt` — Python dependencies.

- frontend/
  - `package.json`, `tsconfig.json`, `vite.config.ts` — Frontend build configuration.
  - `src/` — React app sources (`App.tsx`, components, contexts, etc.).
  - `server.ts` — Optional local development server script for the frontend.
  - `test_similar.js` / `test_similar.py` — Example/test scripts.

## Backend — Setup & Run

Prereqs: Python 3.9+ recommended.

1. Create and activate a virtual environment (optional but recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Run the backend:

```bash
python backend/main.py
```

Notes:
- The backend uses `submissions_db.json` for demo data and `backend/uploads/` for file storage.
- Check `backend/main.py` for the exact port and endpoints used by the backend server.

## Frontend — Setup & Run

Prereqs: Node 16+ / npm or Yarn. Vite is used for development.

1. Install dependencies:

```bash
cd frontend
npm install
# or: yarn
```

2. Start the dev server:

```bash
npm run dev
# or if project has a start script: npm start
```

3. Open the app in your browser at the URL printed by Vite (usually `http://localhost:5173`).

Notes:
- Use the Demo Editor credentials at the top to sign in from the UI.
- Frontend configuration and API base URL may be set in `src/api.ts` or `frontend/server.ts`.

## Running both locally

1. Start the backend first so API endpoints are available.
2. Start the frontend and confirm it points to the backend API base URL.

## Tests & Utilities

- `frontend/test_similar.js` and `frontend/test_similar.py` are example scripts for similarity checks — run them with Node or Python respectively.

## Notes for Developers

- This project is organized for clarity rather than production hardening. For production use, add proper authentication, persistent database, and secure file storage.
- To change the demo login, update `backend/users.py` (or the auth provider used by the backend) and the frontend login UI if necessary.

## Contributing

Feel free to open issues or pull requests. Small improvements like adding environment variable support, Dockerfiles, or CI would be useful next steps.

## License

This repository is provided as-is for the coding challenge.
