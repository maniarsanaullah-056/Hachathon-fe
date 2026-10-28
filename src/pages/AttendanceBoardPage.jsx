import { useState } from 'react';
import { CalendarDays, Filter, Users, Clock, CircleCheck, Clock3, Sun, CircleX, Palmtree } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { attendanceApi } from '../services/hcmServices.js';
import { departmentsApi } from '../services/orgService.js';
import { PageHeader, Badge, ErrorBanner, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import { formatDate } from '../utils/format.js';

export default function AttendanceBoardPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [departmentId, setDepartmentId] = useState('');

  const { data: boardData, loading, error, reload } = useFetch(
    () => attendanceApi.getBoard({ date, departmentId }),
    [date, departmentId]
  );

  const { data: departments } = useFetch(() => departmentsApi.list(), []);
  const deptList = departments || [];

  const records = boardData?.records || boardData?.items || [];
  const summary = boardData?.summary || {
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    halfDay: records.filter((r) => r.status === 'half_day').length,
    absent: records.filter((r) => r.status === 'absent').length,
    onLeave: records.filter((r) => r.status === 'on_leave').length,
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">
            {r.employee?.fullName || r.employeeName || 'Unknown'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {r.employee?.employeeCode || r.employeeCode || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (r) => r.employee?.department?.name || r.department || '-',
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (r) =>
        r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (r) =>
        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    },
    {
      key: 'workedHours',
      label: 'Worked Time',
      render: (r) => (r.workedHours ? `${r.workedHours} hrs` : '-'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status?.toUpperCase()}</Badge>,
    },
  ];

  const statusSummary = [
    { label: 'Present', value: summary.present, icon: CircleCheck, color: 'text-emerald-700 dark:text-emerald-300', iconColor: 'text-emerald-600 dark:text-emerald-400', surface: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Late', value: summary.late, icon: Clock3, color: 'text-amber-700 dark:text-amber-300', iconColor: 'text-amber-600 dark:text-amber-400', surface: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Half day', value: summary.halfDay, icon: Sun, color: 'text-orange-700 dark:text-orange-300', iconColor: 'text-orange-600 dark:text-orange-400', surface: 'bg-orange-50 dark:bg-orange-950/40' },
    { label: 'Absent', value: summary.absent, icon: CircleX, color: 'text-red-700 dark:text-red-300', iconColor: 'text-red-600 dark:text-red-400', surface: 'bg-red-50 dark:bg-red-950/40' },
    { label: 'On leave', value: summary.onLeave, icon: Palmtree, color: 'text-blue-700 dark:text-blue-300', iconColor: 'text-blue-600 dark:text-blue-400', surface: 'bg-blue-50 dark:bg-blue-950/40' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-7">
      <PageHeader
        title="Daily Attendance Board"
        description="A clear view of today’s check-ins, working hours and attendance status."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Attendance filters">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance date</span>
            <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/70">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Attendance date"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none [color-scheme:light] dark:text-slate-100 dark:[color-scheme:dark]"
            />
            </span>
          </label>

          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department</span>
            <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/70">
            <Filter className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              aria-label="Filter by department"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100"
            >
              <option value="">All Departments</option>
              {deptList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            </span>
          </label>
        </div>

          <div className="flex flex-wrap gap-2" aria-label="Attendance status summary">
            {statusSummary.map(({ label, value, icon: Icon, color, iconColor, surface }) => (
              <div key={label} className={`flex min-h-10 items-center gap-2 rounded-xl px-3 ${surface}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
                <span className={`text-xs font-semibold ${color}`}>{label}</span>
                <span className={`text-xs font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300 sm:px-5">
          <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span><strong className="font-semibold text-slate-900 dark:text-slate-100">{records.length}</strong> attendance {records.length === 1 ? 'record' : 'records'}</span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </section>

      <ErrorBanner message={error} onRetry={reload} />

      {/* Board Table */}
      <Table columns={columns} rows={records} loading={loading} emptyMessage="Attendance records for this date will appear here once employees check in. Try another date or department if you expected to see records." />
    </div>
  );
}
