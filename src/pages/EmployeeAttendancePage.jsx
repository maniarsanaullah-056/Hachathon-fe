import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { attendanceApi, correctionsApi } from '../services/hcmServices.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, Spinner, statusTone } from '../components/ui/Common.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input, Textarea } from '../components/ui/Field.jsx';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function EmployeeAttendancePage() {
  const toast = useToast();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDay, setSelectedDay] = useState(null);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  
  // Correction form state
  const [proposedCheckIn, setProposedCheckIn] = useState('');
  const [proposedCheckOut, setProposedCheckOut] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: attendanceHistory, loading, error, reload } = useFetch(
    () => attendanceApi.getMyHistory(selectedMonth),
    [selectedMonth]
  );

  const records = attendanceHistory?.records || attendanceHistory || [];
  const recordsMap = new Map();
  if (Array.isArray(records)) {
    records.forEach((r) => {
      const d = r.date ? r.date.slice(0, 10) : '';
      if (d) recordsMap.set(d, r);
    });
  }

  // Generate calendar days for current selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayWeekday = new Date(year, monthIndex, 1).getDay();

  const handleDayClick = (dayNum) => {
    const dayStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const rec = recordsMap.get(dayStr) || { date: dayStr, status: 'absent' };
    setSelectedDay(rec);
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify the reason for correction');
      return;
    }
    setSubmitting(true);
    try {
      await correctionsApi.create({
        date: selectedDay?.date,
        proposedCheckIn: proposedCheckIn ? `${selectedDay?.date}T${proposedCheckIn}:00.000Z` : undefined,
        proposedCheckOut: proposedCheckOut ? `${selectedDay?.date}T${proposedCheckOut}:00.000Z` : undefined,
        reason,
      });
      toast.success('Attendance correction request submitted to HR');
      setCorrectionModalOpen(false);
      setReason('');
      setProposedCheckIn('');
      setProposedCheckOut('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit correction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance Calendar"
        description="Monthly presence heatmap, logged worked hours and dispute correction tickets."
      />

      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Month:</span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Heatmap Matrix */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-50/50 dark:bg-slate-900/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
              const rec = recordsMap.get(dayStr);
              const status = rec?.status || 'none';
              const isSelected = selectedDay?.date === dayStr;

              const statusColor = {
                present: 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400',
                late: 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400',
                half_day: 'bg-orange-500/15 border-orange-500 text-orange-700 dark:text-orange-400',
                absent: 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-400',
                on_leave: 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-400',
                none: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
              }[status];

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between text-left transition hover:scale-105 ${statusColor} ${
                    isSelected ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  <span className="text-xs font-bold">{dayNum}</span>
                  {status !== 'none' && (
                    <span className="text-[9px] font-semibold uppercase truncate">{status}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-amber-500" /> Late</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-orange-500" /> Half Day</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-red-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-blue-500" /> Leave</span>
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div>
          <Card title="Day Details" description={selectedDay ? formatDate(selectedDay.date) : 'Click any date to inspect'}>
            {selectedDay ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Recorded Status:</span>
                  <Badge tone={statusTone(selectedDay.status)}>{selectedDay.status?.toUpperCase()}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 text-[10px]">Check In</span>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {selectedDay.checkInTime ? new Date(selectedDay.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 text-[10px]">Check Out</span>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {selectedDay.checkOutTime ? new Date(selectedDay.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    className="w-full text-indigo-600 dark:text-indigo-400 border-indigo-200"
                    onClick={() => setCorrectionModalOpen(true)}
                  >
                    Request Attendance Correction
                  </Button>
                </div>
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-slate-400">
                Select a day on the calendar to view timestamps or submit a punch correction request.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Correction Form Modal */}
      <Modal
        open={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title={`Request Correction for ${selectedDay ? formatDate(selectedDay.date) : ''}`}
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              label="Proposed Check In"
              value={proposedCheckIn}
              onChange={(e) => setProposedCheckIn(e.target.value)}
            />
            <Input
              type="time"
              label="Proposed Check Out"
              value={proposedCheckOut}
              onChange={(e) => setProposedCheckOut(e.target.value)}
            />
          </div>

          <Textarea
            label="Reason for Correction *"
            placeholder="e.g. Biometrics terminal offline, power outage, or external assignment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCorrectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit to HR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
