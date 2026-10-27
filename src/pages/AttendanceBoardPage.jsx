import { useState } from 'react';
import { Calendar, Filter, Users, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { attendanceApi } from '../services/hcmServices.js';
import { departmentsApi } from '../services/orgService.js';
import { PageHeader, Badge, Card, Spinner, ErrorBanner, statusTone } from '../components/ui/Common.jsx';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance Board"
        description="Real-time employee presence, check-in timestamps and status breakdown."
      />

      {/* Filter and Date Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {deptList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chips for summary counts */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">Present: {summary.present}</Badge>
          <Badge tone="amber">Late: {summary.late}</Badge>
          <Badge tone="orange">Half Day: {summary.halfDay}</Badge>
          <Badge tone="red">Absent: {summary.absent}</Badge>
          <Badge tone="blue">On Leave: {summary.onLeave}</Badge>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {/* Board Table */}
      <Table columns={columns} rows={records} loading={loading} />
    </div>
  );
}
