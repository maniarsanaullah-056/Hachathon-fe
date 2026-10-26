import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Clock, Calendar, DollarSign, FileText, History, 
  Mail, Phone, MapPin, Building2, Briefcase, Edit, DollarSign as Cash 
} from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import api, { unwrap } from '../services/api.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, Spinner, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import SalaryStructureModal from '../components/SalaryStructureModal.jsx';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview'); // overview | attendance | leaves | salary | payslips | timeline
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Fetch 360 employee aggregated data
  const { data: profile360, loading, error, reload } = useFetch(
    () => unwrap(api.get(`/employees/${id}/360`)),
    [id]
  );

  if (loading && !profile360) return <Spinner size="lg" />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  const emp = profile360?.employee || profile360 || {};
  const recentAttendance = profile360?.recentAttendance || [];
  const leaveBalances = profile360?.leaveBalances || [];
  const salary = profile360?.salaryStructure || emp.salaryStructure || {};
  const payslips = profile360?.payslips || [];
  const timeline = profile360?.timeline || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leave Balances', icon: Calendar },
    { id: 'salary', label: 'Salary Structure', icon: Cash },
    { id: 'payslips', label: 'Payslips', icon: FileText },
    { id: 'timeline', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={emp.fullName || 'Employee 360'}
        description={`Employee Code: ${emp.employeeCode} • ${emp.designation?.title || 'Staff'} in ${emp.department?.name || 'Operations'}`}
        backTo="/employees"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setSalaryModalOpen(true)}>
              <DollarSign className="h-4 w-4" />
              <span>Edit Salary Structure</span>
            </Button>
            <Badge tone={statusTone(emp.employmentStatus)}>
              {(emp.employmentStatus || 'Active').toUpperCase()}
            </Badge>
          </div>
        }
      />

      {/* Hero Badge Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-xl font-bold text-white shadow-md">
            {emp.fullName?.[0]?.toUpperCase() || 'E'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{emp.fullName}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {emp.email}</span>
              {emp.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {emp.phone}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(emp.joiningDate)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Gross Compensation</span>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCurrency((salary.basicSalary || emp.basicSalary || 0) * 1.5)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Employment Particulars">
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div><dt className="text-slate-400">Department</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{emp.department?.name || '-'}</dd></div>
              <div><dt className="text-slate-400">Designation</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{emp.designation?.title || '-'}</dd></div>
              <div><dt className="text-slate-400">Gender</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white uppercase">{emp.gender || '-'}</dd></div>
              <div><dt className="text-slate-400">Status</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white uppercase">{emp.employmentStatus}</dd></div>
            </dl>
          </Card>

          <Card title="Contact & Address">
            <dl className="grid grid-cols-1 gap-4 text-xs">
              <div><dt className="text-slate-400">Official Email</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{emp.email}</dd></div>
              <div><dt className="text-slate-400">Phone</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{emp.phone || 'Not set'}</dd></div>
              <div><dt className="text-slate-400">Home Address</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{emp.address || 'Not registered'}</dd></div>
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card title="Recent Attendance Records">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAttendance.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No recent punches</p>
            ) : (
              recentAttendance.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <span className="font-semibold">{formatDate(a.date)}</span>
                    <span className="text-slate-400 block text-[10px]">
                      {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {' → '}
                      {a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status?.toUpperCase()}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeTab === 'leaves' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {leaveBalances.map((b, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-500">{b.name}</span>
              <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{b.remaining ?? b.balance ?? 0}</p>
              <span className="text-[10px] text-slate-400">Days Remaining</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'salary' && (
        <Card
          title="Salary Structure Details"
          actions={
            <Button variant="secondary" onClick={() => setSalaryModalOpen(true)}>
              Edit Structure
            </Button>
          }
        >
          <div className="space-y-3 text-xs max-w-md">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Basic Salary:</span>
              <span className="font-bold">{formatCurrency(salary.basicSalary || emp.basicSalary || 0)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">HRA Allowance (40%):</span>
              <span className="font-bold">{formatCurrency(salary.hraAllowance || Math.round((salary.basicSalary || emp.basicSalary || 0) * 0.4))}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Medical Allowance (10%):</span>
              <span className="font-bold">{formatCurrency(salary.medicalAllowance || Math.round((salary.basicSalary || emp.basicSalary || 0) * 0.1))}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Other Allowance:</span>
              <span className="font-bold">{formatCurrency(salary.otherAllowance || 0)}</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'payslips' && (
        <Card title="Finalized Payslips">
          {payslips.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No payslips published</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {payslips.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <span className="font-bold">{p.month}</span>
                    <span className="text-slate-400 block text-[10px]">Net: {formatCurrency(p.netSalary)}</span>
                  </div>
                  <Badge tone="green">PAID</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card title="Employee Journey Timeline">
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Joined the Company</p>
                <p className="text-[10px] text-slate-400">{formatDate(emp.joiningDate)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Salary Structure Edit Modal */}
      <SalaryStructureModal
        open={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        employee={emp}
        onSaved={reload}
      />
    </div>
  );
}
