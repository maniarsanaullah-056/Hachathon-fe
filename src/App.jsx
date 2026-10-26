import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { Button, FullPageSpinner } from './components/ui/Common.jsx';

// Core Pages
import SetupPage from './pages/SetupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CompanySettingsPage from './pages/CompanySettingsPage.jsx';
import OrganizationPage from './pages/OrganizationPage.jsx';
import LeaveSettingsPage from './pages/LeaveSettingsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import EmployeeProfilePage from './pages/EmployeeProfilePage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';

// Phase 2 & 3 High-Value Enterprise Modules
import AttendanceBoardPage from './pages/AttendanceBoardPage.jsx';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage.jsx';
import CorrectionsPage from './pages/CorrectionsPage.jsx';
import LeavePage from './pages/LeavePage.jsx';
import LeaveApprovalsPage from './pages/LeaveApprovalsPage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import PayslipsPage from './pages/PayslipsPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';

import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROLES } from './utils/roles.js';

export default function App() {
  const { user, setupComplete, loading, initError, retryInit } = useAuth();

  if (loading) return <FullPageSpinner />;

  if (initError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center bg-slate-50 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Cannot connect to the backend server</h1>
        <p className="max-w-md text-sm text-slate-500">{initError}</p>
        <Button onClick={retryInit}>Try again</Button>
      </div>
    );
  }

  // First-Run Setup Wizard
  if (!setupComplete) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<Navigate to="/" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route element={<AppLayout />}>
          {/* Unified Role Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Employee Exclusive Operations */}
          <Route element={<ProtectedRoute roles={[ROLES.EMPLOYEE]} />}>
            <Route path="/my-profile" element={<MyProfilePage />} />
            <Route path="/attendance" element={<EmployeeAttendancePage />} />
            <Route path="/leaves" element={<LeavePage />} />
            <Route path="/payslips" element={<PayslipsPage />} />
          </Route>

          {/* HR & Admin Staff Shared Operations */}
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.HR]} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/attendance/board" element={<AttendanceBoardPage />} />
            <Route path="/corrections" element={<CorrectionsPage />} />
            <Route path="/leaves/approvals" element={<LeaveApprovalsPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/organization" element={<OrganizationPage />} />
          </Route>

          {/* Admin Exclusive Governance */}
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/leave-settings" element={<LeaveSettingsPage />} />
            <Route path="/company" element={<CompanySettingsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
          </Route>

          {/* All Roles */}
          <Route path="/announcements" element={<AnnouncementsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
