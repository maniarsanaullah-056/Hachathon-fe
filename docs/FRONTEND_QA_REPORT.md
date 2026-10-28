# HCM Lite Frontend QA Report

Date: 2026-10-28  
Scope: frontend repository plus API contract in the sibling `Hachathon-BE` checkout.

## Environment and limits

- Frontend production build: PASS (`npm run build`).
- Backend/API contract: read from `../Hachathon-BE/docs/API.md` and backend README. This frontend checkout has no `docs/API.md`; the canonical API spec is in the backend project.
- The backend `.env` points to a hosted Atlas database and contains credentials. It was not used or reset. No local MongoDB server/CLI is installed or listening on port 27017, so real setup, seeded role accounts, and stateful end-to-end scenarios could not safely run.
- Playwright and `@axe-core/playwright` are installed. `npx playwright install chromium` was attempted, but the 197.5 MiB Chromium download remained at 0%; test launch reports the missing `chromium_headless_shell` executable. Browser assertions and screenshots are therefore BLOCKED by browser installation, not reported as passing.
- No backend business logic was changed. No API mismatch could be confirmed by comparing live responses because no isolated DB-backed backend run was available.
- QA assumes the user-facing late threshold means any threshold count of lates within the payroll month, consistent with the backend README and payroll implementation.

## Bugs found and fixed

| Finding | Fix |
|---|---|
| Late penalty setting called the threshold “Consecutive” although payroll counts all late arrivals in the month. | Changed label and help text in `src/pages/CompanySettingsPage.jsx`. |
| A signed-in employee opening an Admin/HR route was redirected to Login because authentication was checked before role authorization. | Check the authenticated user's role first in `src/components/ProtectedRoute.jsx`; unauthorized users go to the themed 403 page without rendering protected content. |
| 403 page ignored dark theme and its return target was below the requested touch size. | Added light/dark page colors and a 44px minimum action target in `src/pages/UnauthorizedPage.jsx`. |
| Initial theme class was applied after React mounted, allowing a wrong-theme flash. Native controls did not get a matching `color-scheme`. | Apply the saved/system theme in the document head and during theme state initialization; set `colorScheme` in `index.html` and `src/context/ThemeContext.jsx`. |
| Tailwind v4's default `dark:` variant followed the OS preference instead of the app's `.dark` class, so the theme button changed its icon/storage without repainting the UI. | Bound the `dark:` variant to `.dark` in `src/index.css`; added a regression test that checks the dashboard background changes when the toggle is clicked. |
| Setup wizard password fields were side-by-side on narrow screens. | Stack them at mobile widths in `src/pages/SetupPage.jsx`. |
| Login page exposed a hard-coded judge demo password helper. | Removed the helper from `src/pages/LoginPage.jsx`. |
| Shared input/select/textarea labels were not programmatically associated with their controls. | Generate stable control IDs and connect labels in `src/components/ui/Field.jsx`. |
| Several dark sub-cards used the nonexistent Tailwind `slate-850` shade, so the light translucent background remained visible in dark mode (including Workforce Demographics). | Replaced invalid shades with `slate-800` and improved the demographics label contrast in `src/pages/dashboards/AdminDashboard.jsx` and other affected UI components. |

## Test results by requested test ID

Status legend: **PASS (code review/build)** means the change or contract was verified statically/build-only; **BLOCKED** means a real browser/backend scenario was not run. No end-to-end result is claimed as PASS.

| Test IDs | Result | Notes / retest |
|---|---|---|
| 1.1 | BLOCKED | Setup routing test added; browser binary missing. Fresh DB unavailable. |
| 1.2–1.5 | BLOCKED | Login, session expiry, password change, and role menus require browser/backend accounts. Role guard code corrected. |
| 2.1 | PARTIAL | Late-rule label fixed. Persistence, geofence map/current location, save toast, and map behavior not verified; UI currently uses a radar illustration rather than Leaflet. |
| 2.2–2.7 | BLOCKED | CRUD, HR account lifecycle, dashboard data, payroll locking, audit diff, and view-only controls require a live API. |
| 3.1–3.8 | BLOCKED | Employee creation/import, directory server paging, attendance/leave/payroll approvals, and announcements require live API data. |
| 4.1–4.8 | BLOCKED | Employee flows require persisted users and attendance/leave/payroll/notification data. |
| 5.1–5.4 | PARTIAL | AI routes are centralized in `src/services/hcmServices.js`; no live AI provider test. Floating launcher collision and busy states need viewport browser checks. |
| 6.1 | PARTIAL | Fixed role guard and added a mocked Playwright regression; execution blocked by Chromium install. |
| 6.2–6.3 | PARTIAL | Token uses localStorage and clears on 401/logout by code inspection; bundle/console and secrets audit not performed end-to-end. Frontend `.env.example` contains only the API URL. |
| 7.1–7.3 | BLOCKED | Full theme/component contrast review and screenshots require Chromium. Theme flash and native control color-scheme corrected. |
| 7.4 | PARTIAL | Theme bootstrap fix and persistence assertion added; browser run blocked. System preference is selected on initial load. |
| 7.5 | PARTIAL | Setup form stacks on mobile; 375px overflow assertion added but browser run blocked. Other screens remain unverified. |
| 7.6–7.9 | BLOCKED | Full loading/empty/error-state, responsive, formatting, form, console/network, and visual regression pass requires live browser/API. |
| 7.10 | BLOCKED | Axe test added for setup route; Chromium unavailable. All-screen, both-theme axe coverage remains outstanding. |
| 8 | BLOCKED | No isolated MongoDB service available; hosted DB was intentionally left untouched. |

## Playwright checks added

`tests/e2e/frontend.spec.js` includes checks for setup routing, the employee-to-admin 403 guard, persisted dark theme, 375px setup overflow, and serious/critical axe findings on setup. Run with `npm run test:e2e`; run the axe-tagged test with `npm run test:a11y`.

## API mismatches

No response mismatch verified. The frontend unwraps the documented `{ success, data }` envelope in `src/services/api.js`. The backend documentation says ordinary web check-in may submit `{ source: "web" }`; the frontend does so. Live contract validation remains blocked.

## Remaining limitations and manual checklist

- Install Chromium with `npx playwright install chromium`, then rerun the browser suite.
- Configure a disposable local MongoDB database and point a separately launched backend at that QA database; do not reuse a production/hosted URI for destructive QA.
- Complete all role journeys, role/theme/device screenshot matrix, console/network checks, and axe checks against that isolated environment.
- Manually verify real AI responses/provider failures, camera permission and face detection, GPS/geofence behavior, and physical mobile-device behavior.
- The requested Leaflet map is not implemented in the current Company Settings page; it currently shows a static radar-style geofence preview.
