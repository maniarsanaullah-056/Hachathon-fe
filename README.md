# HCM Lite Frontend

React 18 + Vite frontend for HCM Lite. The API server is maintained separately in `../Hachathon-BE`.

## Requirements

- Node.js 18 or newer
- The HCM Lite backend and a MongoDB database (see `../Hachathon-BE/README.md`)

## Install and run

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to the backend API base URL, including `/api` (default `http://localhost:5000/api`). Start the backend separately. On an empty database, open the frontend URL and complete the first-run setup wizard.

## Build and browser QA

```powershell
npm run build
npm run test:e2e
npm run test:a11y
```

Playwright uses Chromium. Install it once with `npx playwright install chromium`. Browser checks that need persistent users, attendance, leave, payroll, PDFs, or AI require an isolated QA MongoDB database and a running backend. The tests in `tests/e2e` mock only the setup/auth endpoints needed to check frontend routing and rendering; they do not provision business data.

See [docs/FRONTEND_QA_REPORT.md](docs/FRONTEND_QA_REPORT.md) for the latest QA results and known environment limitations.
