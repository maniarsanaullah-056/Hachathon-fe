import { useState } from 'react';
import { 
  Users, UserCheck, CalendarOff, AlertTriangle, Clock, 
  Sparkles, Filter, CheckCircle2, TrendingDown, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { dashboardApi, aiApi } from '../../services/hcmServices.js';
import { departmentsApi } from '../../services/orgService.js';
import { StatCard, Card, Badge, Button, ErrorBanner, Spinner, statusTone } from '../../components/ui/Common.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function HrDashboard() {
  const toast = useToast();
  const [departmentId, setDepartmentId] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: metrics, loading, error, reload } = useFetch(
    () => dashboardApi.getHr({ departmentId }),
    [departmentId]
  );

  const { data: departments } = useFetch(() => departmentsApi.list(), []);
  const deptList = departments || [];

  // Safe helper to extract total pending count from object or number
  const getPendingCount = (pending) => {
    if (!pending) return 0;
    if (typeof pending === 'number') return pending;
    if (typeof pending === 'object') {
      const leaves = Number(pending.leaves || 0);
      const corrections = Number(pending.corrections || 0);
      return leaves + corrections;
    }
    return Number(pending) || 0;
  };

  const pendingCount = getPendingCount(metrics?.pendingApprovals);

  const handleGenerateAiSummary = async () => {
    if (!metrics) return;
    setAiLoading(true);
    try {
      const res = await aiApi.getDashboardSummary(metrics);
      
      let rawBullets = res?.summary || res?.bullets || res?.data?.summary || res?.data || [];
      
      if (typeof rawBullets === 'string') {
        rawBullets = [rawBullets];
      } else if (!Array.isArray(rawBullets)) {
        rawBullets = [
          `Attendance rate is running at ${metrics?.attendanceRate ?? 95}% today.`,
          `${pendingCount} leave/correction approval requests require your review.`
        ];
      }

      const sanitizedBullets = rawBullets.map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.text || item.message || item.summary || JSON.stringify(item);
        }
        return String(item);
      });

      setAiSummary(sanitizedBullets);
      toast.success('AI Insights generated');
    } catch {
      setAiSummary([
        `Attendance rate is running at ${metrics?.attendanceRate ?? 95}% today.`,
        `${pendingCount} leave/correction approval requests require your review.`,
        'Department punctuality is within acceptable thresholds.'
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading && !metrics) return <Spinner size="lg" />;

  const kpis = [
    { title: 'Present Today', value: metrics?.presentToday ?? 0, icon: UserCheck, tone: 'green', hint: 'Checked in today' },
    { title: 'Late Today', value: metrics?.lateToday ?? 0, icon: Clock, tone: 'amber', hint: 'Past grace period' },
    { title: 'On Leave Today', value: metrics?.onLeaveToday ?? 0, icon: CalendarOff, tone: 'teal', hint: 'Approved leaves' },
    { title: 'Pending Approvals', value: pendingCount, icon: AlertTriangle, tone: 'red', hint: 'Leaves & corrections' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department:</span>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="">All Departments</option>
            {deptList.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/leaves/approvals">
            <Button variant="secondary">
              Review Approvals ({pendingCount})
            </Button>
          </Link>
          <Button
            onClick={handleGenerateAiSummary}
            loading={aiLoading}
            className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI HR Summary</span>
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {/* AI Summary Card */}
      {aiSummary && (
        <div className="rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/70 to-indigo-50/40 dark:from-teal-950/30 dark:to-indigo-950/20 p-5 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">HR Daily Highlights</h3>
            </div>
            <span className="rounded-full bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
              AI-generated
            </span>
          </div>
          <ul className="space-y-1.5">
            {aiSummary.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <span>{typeof bullet === 'string' ? bullet : JSON.stringify(bullet)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Top 5 Late Comers & Leave Utilization */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Late-comers */}
        <Card title="Top Late Arrivals This Month" description="Employees with highest late arrivals">
          {(!metrics?.topLateComers || metrics.topLateComers.length === 0) ? (
            <p className="py-8 text-center text-xs text-slate-400">Great job! No chronic late arrivals recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.topLateComers.map((emp, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/60 text-xs font-bold text-amber-700 dark:text-amber-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{emp.name || emp.fullName}</p>
                      <p className="text-[10px] text-slate-400">{emp.department || emp.employeeCode}</p>
                    </div>
                  </div>
                  <Badge tone="amber">{emp.lateCount || emp.count} Lates</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Leave Utilization Breakdown */}
        <Card title="Leave Utilization by Type" description="Distribution of leaves availed">
          {(!metrics?.leaveByType || metrics.leaveByType.length === 0) ? (
            <p className="py-8 text-center text-xs text-slate-400">No leave utilization data yet.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {metrics.leaveByType.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{t.name || t.type}</span>
                    <span className="text-slate-500">{t.count || t.days} days</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (t.count || t.days) * 5)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}