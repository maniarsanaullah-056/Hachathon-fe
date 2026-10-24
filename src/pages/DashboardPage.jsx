import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { departmentsApi, designationsApi, holidaysApi, leaveTypesApi } from '../services/orgService.js';
import { employeesApi, usersApi } from '../services/peopleService.js';
import { Badge, Card, ErrorBanner, PageHeader, Spinner } from '../components/ui/Common.jsx';
import { ROLES } from '../utils/roles.js';

function SetupChecklist({ counts, isAdmin }) {
  const items = [
    { label: 'Review company settings', to: '/company', adminOnly: true },
    { label: 'Create departments', to: '/organization', done: counts.departments > 0 },
    { label: 'Create designations', to: '/organization', done: counts.designations > 0 },
    { label: 'Configure leave types and quotas', to: '/leave-settings', adminOnly: true, done: counts.leaveTypes > 0 },
    { label: 'Add public holidays', to: '/leave-settings', adminOnly: true, done: counts.holidays > 0 },
    { label: 'Create HR accounts', to: '/users', adminOnly: true, done: counts.hrUsers > 0 },
    { label: 'Register employees', to: '/employees', done: counts.employees > 0 },
  ].filter((i) => isAdmin || !i.adminOnly);

  return (
    <Card title="Getting started" description="Complete these steps to set up your organization. Progress is calculated from your real data.">
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{item.done ? '✓' : '·'}</span>
              <span className="text-sm text-slate-700">{item.label}</span>
            </div>
            <Link to={item.to} className="text-sm font-medium text-indigo-600 hover:underline">{item.done ? 'Manage' : 'Open'}</Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StaffDashboard({ isAdmin }) {
  const { data, loading, error, reload } = useFetch(async () => {
    const [departments, designations, employees] = await Promise.all([
      departmentsApi.list(),
      designationsApi.list(),
      employeesApi.list({ limit: 1 }),
    ]);
    const counts = { departments: departments.length, designations: designations.length, employees: employees.pagination.total };
    if (isAdmin) {
      const [leaveTypes, holidays, hrUsers] = await Promise.all([leaveTypesApi.list(), holidaysApi.list(), usersApi.list()]);
      Object.assign(counts, { leaveTypes: leaveTypes.length, holidays: holidays.length, hrUsers: hrUsers.length });
    }
    return counts;
  }, [isAdmin]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  const stats = [
    { label: 'Employees', value: data.employees },
    { label: 'Departments', value: data.departments },
    { label: 'Designations', value: data.designations },
    ...(isAdmin ? [{ label: 'HR accounts', value: data.hrUsers }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <SetupChecklist counts={data} isAdmin={isAdmin} />
      <p className="text-xs text-slate-400">Attendance, leave, payroll and AI insights widgets arrive in later phases. All numbers on this page come from the database.</p>
    </div>
  );
}

function EmployeeDashboard() {
  const { data: me, loading, error, reload } = useFetch(() => employeesApi.me(), []);
  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  return (
    <Card title="Your profile" description="Check-in, leave balances, payslips and the AI assistant will appear here in later phases.">
      <dl className="grid gap-4 sm:grid-cols-3">
        <div><dt className="text-xs uppercase text-slate-500">Employee code</dt><dd className="mt-1 font-medium">{me.employeeCode}</dd></div>
        <div><dt className="text-xs uppercase text-slate-500">Department</dt><dd className="mt-1 font-medium">{me.department?.name}</dd></div>
        <div><dt className="text-xs uppercase text-slate-500">Designation</dt><dd className="mt-1 font-medium">{me.designation?.title}</dd></div>
      </dl>
      <Link to="/my-profile" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">View and update my profile</Link>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.ADMIN;
  const isStaff = isAdmin || user.role === ROLES.HR;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description={isAdmin ? 'Admin dashboard' : user.role === ROLES.HR ? 'HR dashboard' : 'Employee dashboard'}
        actions={<Badge tone="indigo">{user.role.toUpperCase()}</Badge>}
      />
      {isStaff ? <StaffDashboard isAdmin={isAdmin} /> : <EmployeeDashboard />}
    </>
  );
}
