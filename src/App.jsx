import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { Button, FullPageSpinner } from './components/ui/Common.jsx';
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
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROLES } from './utils/roles.js';

export default function App() {
  const { user, setupComplete, loading, initError, retryInit } = useAuth();

  if (loading) return <FullPageSpinner />;

  if (initError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cannot connect to the server</h1>
        <p className="max-w-md text-sm text-slate-500">{initError}</p>
        <Button onClick={retryInit}>Try again</Button>
      </div>
    );
  }

  // Pehli baar: company setup ke baghair koi aur page nahi khulta
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
          <Route index element={<DashboardPage />} />

          <Route element={<ProtectedRoute roles={[ROLES.EMPLOYEE]} />}>
            <Route path="/my-profile" element={<MyProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.HR]} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/organization" element={<OrganizationPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/leave-settings" element={<LeaveSettingsPage />} />
            <Route path="/company" element={<CompanySettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
