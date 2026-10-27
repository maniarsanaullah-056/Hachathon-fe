import { useAuth } from '../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../utils/roles.js';
import { PageHeader, Badge } from '../components/ui/Common.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';
import HrDashboard from './dashboards/HrDashboard.jsx';
import EmployeeDashboard from './dashboards/EmployeeDashboard.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}`}
        description={
          role === ROLES.ADMIN
            ? 'Executive overview of company headcount, financial run rates and compliance.'
            : role === ROLES.HR
            ? 'Daily workforce operations, live attendance records and approval pipelines.'
            : 'Personal attendance, leaves, shift schedule and monthly payslips.'
        }
        actions={
          <Badge tone={role === ROLES.ADMIN ? 'indigo' : role === ROLES.HR ? 'teal' : 'green'}>
            {ROLE_LABELS[role]?.toUpperCase()}
          </Badge>
        }
      />

      {role === ROLES.ADMIN && <AdminDashboard />}
      {role === ROLES.HR && <HrDashboard />}
      {role === ROLES.EMPLOYEE && <EmployeeDashboard />}
    </div>
  );
}
