# Frontend Status & Feature Matrix - HCM Lite

## 1. Executive Summary
The frontend of **HCM Lite** has been fully implemented, styled in a modern Linear/Stripe aesthetic, and verified with zero compilation errors (`vite build` exit 0). All role flows (Admin, HR, Employee) are integrated into a single, cohesive single-page application with dark/light mode, mobile-responsive collapsible navigation, and real-time backend synchronization.

---

## 2. Comprehensive Screen & Feature Matrix

| Screen / Feature | Role(s) | Status | File Path(s) | Implementation Details |
|---|---|---|---|---|
| **First-Run Setup Wizard** | Public | **DONE** | `src/pages/SetupPage.jsx` | 2-step setup wizard (Organization particulars -> Master admin setup), auto-attaches session token upon completion. |
| **Login Page** | Public | **DONE** | `src/pages/LoginPage.jsx` | Linear-inspired split hero layout, quick-fill demo credentials for judges, error banner mapping, auto-redirect. |
| **Change Password** | All | **DONE** | `src/pages/ChangePasswordPage.jsx` | Mandatory first-login check (`mustChangePassword`), inline validation, direct auth sync. |
| **Admin Dashboard** | Admin | **DONE** | `src/pages/dashboards/AdminDashboard.jsx` | Live KPIs (headcount, attrition YTD, total payroll, avg salary), department distributions, demographics, announcements, audit feed, and **AI Executive Briefing** button. |
| **HR Dashboard** | HR | **DONE** | `src/pages/dashboards/HrDashboard.jsx` | Operational KPIs (Present, Late, On Leave, Pending Approvals), top late-arrivals rank, leave utilization progress bars, **AI Daily Insights** summary. |
| **Employee Dashboard** | Employee | **DONE** | `src/pages/dashboards/EmployeeDashboard.jsx` | Live digital clock, Web quick check-in & checkout buttons, worked time counter, 40h weekly progress ring, leave balances, recent payslip card. |
| **Camera & Geolocation Attendance** | Employee | **DONE** | `src/components/CameraCheckInModal.jsx` | Front-facing camera preview, face presence indicator, browser GPS coordinate lock (`lat`, `lng`, `accuracy`), payload sent to `POST /api/attendance/check-in`. |
| **Company Settings & Geofence** | Admin | **DONE** | `src/pages/CompanySettingsPage.jsx` | Work hours, grace period, half-day threshold, interactive weekend day picker, late penalty formulas, "Use My Location" GPS button, visual perimeter radar preview. |
| **Daily Attendance Board** | Admin, HR | **DONE** | `src/pages/AttendanceBoardPage.jsx` | Date & department filters, summary status chips (Present, Late, Half-day, Absent, On Leave), live punches table. |
| **Attendance Corrections Inbox** | Admin, HR | **DONE** | `src/pages/CorrectionsPage.jsx` | Dispute review queue, approval & rejection modal with optional manager explanation comment. |
| **Attendance Calendar Heatmap** | Employee | **DONE** | `src/pages/EmployeeAttendancePage.jsx` | Monthly calendar matrix with color-coded status tiles, day detail inspector, "Request Correction" ticket form. |
| **Smart AI Leave Center** | Employee | **DONE** | `src/pages/LeavePage.jsx` | Real-time balance cards, Natural Language processing search (`POST /ai/smart-leave`) pre-filling form with AI banner confirmation, cancel pending. |
| **Leave Approvals Inbox** | Admin, HR | **DONE** | `src/pages/LeaveApprovalsPage.jsx` | Pending review tab, full approval history, approve/reject dialog with manager notes. |
| **Salary Structure Editor** | Admin, HR | **DONE** | `src/components/SalaryStructureModal.jsx` | Live gross computation (Basic + HRA 40% + Medical 10% + Other = 1.5x basic multiplier). |
| **Monthly Payroll Engine** | Admin, HR | **DONE** | `src/pages/PayrollPage.jsx` | Generate monthly draft run, proration & tax deductions table, recompute action, and Admin **FINALIZE & LOCK MONTH** dialog. |
| **Payslips & PDF Download** | Employee, All | **DONE** | `src/pages/PayslipsPage.jsx` | Itemized breakdown modal (Basic, HRA, Medical, Absents, Late Penalty, Tax, Net) and direct browser PDF download (`GET /api/payslips/:id/pdf`). |
| **Employees Directory** | Admin, HR | **DONE** | `src/pages/EmployeesPage.jsx` | Live search, multi-filter (dept, desig, status, sort), CSV export, multi-step employee register modal with temporary password copy. |
| **Employee 360 View** | Admin, HR, Employee | **DONE** | `src/pages/EmployeeProfilePage.jsx` | 6 unified tabs: Overview, Attendance, Leave Balances, Salary Structure, Payslips, and History Timeline. |
| **CSV Dry-Run Import** | Admin, HR | **DONE** | `src/components/CsvImportModal.jsx` | Upload CSV -> Dry Run validation -> Row errors table -> Confirm real import. |
| **Audit Trail Log** | Admin | **DONE** | `src/pages/AuditLogPage.jsx` | Filter by action & entity, read-only event stream, interactive Before/After JSON diff inspector modal. |
| **Announcements Center** | All | **DONE** | `src/pages/AnnouncementsPage.jsx` | Broadcast news & town hall bulletins (Admin/HR), real-time feed with priority tags for all staff. |
| **Floating AI Assistant** | All | **DONE** | `src/components/AiAssistantDrawer.jsx` | Floating bottom launcher, slide-over drawer, Roman Urdu support, role-specific query suggestion chips, streaming typing state, calls `POST /ai/chat`. |
| **Notifications Center** | All | **DONE** | `src/components/NotificationsPopover.jsx` | Header bell with unread badge count, popover drawer, individual & "Mark all read" controls. |
| **Command Palette (Ctrl+K)** | All | **DONE** | `src/components/CommandPalette.jsx` | Quick keyboard search across all authorized screens and modules. |
| **Theme Engine** | All | **DONE** | `src/context/ThemeContext.jsx` | Light and Dark mode toggle with persistent local storage and CSS custom properties. |

---

## 3. API Alignment & Graceful Degradation
- All API requests are strictly channeled through the unified Axios client in `src/services/api.js` and `src/services/hcmServices.js`.
- Error responses (409 Conflict, 422 Validation Error, 403 Forbidden, 429 Rate Limit) are converted to friendly user alerts via `ToastContext` and `ErrorBanner`.
- Zero dummy data in production: every table, counter, and badge is connected to the backend endpoints.
