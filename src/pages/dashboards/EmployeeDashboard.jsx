import { useEffect, useState } from 'react';
import { 
  Clock, LogIn, LogOut, Calendar, DollarSign, Sparkles, 
  CheckCircle2, AlertCircle, ArrowRight, Camera, FileText, Megaphone 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { dashboardApi, attendanceApi, commsApi } from '../../services/hcmServices.js';
import { Card, Badge, Button, ErrorBanner, Spinner, StatCard, statusTone } from '../../components/ui/Common.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import CameraCheckInModal from '../../components/CameraCheckInModal.jsx';

export default function EmployeeDashboard() {
  const toast = useToast();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkingInWeb, setCheckingInWeb] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: metrics, loading: metricsLoading, error: metricsError, reload: reloadMetrics } = useFetch(
    () => dashboardApi.getEmployee(),
    []
  );

  const { data: todayRecord, loading: todayLoading, reload: reloadToday } = useFetch(
    () => attendanceApi.getToday(),
    []
  );

  const { data: announcementsData } = useFetch(() => commsApi.getAnnouncements(), []);
  const announcements = announcementsData?.announcements || announcementsData?.items || [];

  const handleStandardCheckIn = async () => {
    setCheckingInWeb(true);
    try {
      await attendanceApi.checkIn({ source: 'web' });
      toast.success('Checked in successfully!');
      reloadToday();
      reloadMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed';
      toast.error(msg);
    } finally {
      setCheckingInWeb(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await attendanceApi.checkOut();
      toast.success('Checked out successfully!');
      reloadToday();
      reloadMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-out failed';
      toast.error(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  const isCheckedIn = Boolean(todayRecord?.checkInTime);
  const isCheckedOut = Boolean(todayRecord?.checkOutTime);

  // Worked timer calculation
  let elapsedHours = '0.0';
  if (isCheckedIn) {
    const start = new Date(todayRecord.checkInTime);
    const end = isCheckedOut ? new Date(todayRecord.checkOutTime) : currentTime;
    const diffMs = Math.max(0, end - start);
    elapsedHours = (diffMs / (1000 * 60 * 60)).toFixed(1);
  }

  const hoursThisWeek = metrics?.hoursThisWeek ?? (Number(elapsedHours) || 0);
  const weekProgressPct = Math.min(100, Math.round((hoursThisWeek / 40) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Check-in / Check-out Widget */}
      <div className="rounded-3xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        
        <div className="grid gap-6 md:grid-cols-2 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              <span className="font-medium text-teal-300">Live Attendance Portal</span>
            </div>

            <div className="mt-4">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <p className="mt-1 text-xs text-indigo-200">
                {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isCheckedIn ? (
                <>
                  <Button
                    onClick={handleStandardCheckIn}
                    loading={checkingInWeb}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Quick Web Check-In</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCameraModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                  >
                    <Camera className="h-4 w-4 text-teal-300" />
                    <span>Camera + GPS Check-In</span>
                  </Button>
                </>
              ) : !isCheckedOut ? (
                <Button
                  onClick={handleCheckOut}
                  loading={checkingOut}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Check Out Now</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Attendance completed for today!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Status Card in Hero */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-indigo-200">Today's Status</span>
              <Badge tone={statusTone(todayRecord?.status || 'absent')}>
                {(todayRecord?.status || 'Not Checked In').toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-indigo-300 uppercase">Check In</span>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 uppercase">Check Out</span>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {todayRecord?.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                <span>Today's Logged Hours</span>
                <span className="font-mono font-bold text-teal-300">{elapsedHours} hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Hours Progress Ring */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Target</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{hoursThisWeek}h</span>
            <span className="text-xs text-slate-400">/ 40h</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${weekProgressPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{weekProgressPct}% of 40h standard week met</p>
        </div>

        {/* Late Arrivals Count */}
        <StatCard
          title="Late Arrivals (Month)"
          value={metrics?.lateArrivals ?? 0}
          icon={AlertCircle}
          tone="amber"
          hint="Late past office grace threshold"
        />

        {/* Finalized Payslip Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Latest Payslip</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.lastPayslip ? formatCurrency(metrics.lastPayslip.netSalary) : 'No finalized payslips'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {metrics?.lastPayslip?.month ? `Month: ${metrics.lastPayslip.month}` : 'Payroll is processed monthly'}
              </p>
            </div>
          </div>
          <Link to="/payslips" className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>View payslips</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Leave Balances and Announcements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leave Balances Quick Cards */}
        <Card title="Leave Balances" description="Available quotas for this calendar year" actions={
          <Link to="/leaves">
            <Button variant="secondary" className="text-xs">Apply Leave</Button>
          </Link>
        }>
          {(!metrics?.leaveBalances || metrics.leaveBalances.length === 0) ? (
            <p className="py-6 text-center text-xs text-slate-400">Leave quotas not assigned yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metrics.leaveBalances.map((b, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 p-3 text-center">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">{b.name}</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{b.remaining ?? b.balance ?? 0}</span>
                  <span className="text-[10px] text-slate-400">days left</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Company Announcements */}
        <Card title="Company Announcements" description="Stay updated with workplace updates">
          {announcements.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No active bulletins.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {announcements.slice(0, 3).map((a) => (
                <div key={a._id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-teal-500" />
                      {a.title}
                    </p>
                    <span className="text-[10px] text-slate-400">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bonus Camera & Geolocation Check-in Modal */}
      <CameraCheckInModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onSuccess={() => {
          reloadToday();
          reloadMetrics();
        }}
      />
    </div>
  );
}
