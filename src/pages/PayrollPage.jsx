import { useState } from 'react';
import { 
  DollarSign, Lock, Play, RefreshCw, FileText, ChevronRight, 
  AlertTriangle, CheckCircle2, ShieldCheck, Download 
} from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { payrollApi } from '../services/hcmServices.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/roles.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, Spinner, EmptyState, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Field.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function PayrollPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [targetMonth, setTargetMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [creating, setCreating] = useState(false);

  // Selected run state for detail breakdown
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [recomputing, setRecomputing] = useState(false);

  // Fetch runs list
  const { data: runsData, loading, error, reload: reloadRuns } = useFetch(
    () => payrollApi.listRuns(),
    []
  );

  // Fetch single run detail if selected
  const { data: currentRun, loading: runDetailLoading, reload: reloadCurrentRun } = useFetch(
    () => (selectedRunId ? payrollApi.getRun(selectedRunId) : Promise.resolve(null)),
    [selectedRunId]
  );

  const runs = runsData?.runs || runsData?.items || runsData || [];

  const handleCreateRun = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await payrollApi.createRun(targetMonth);
      toast.success(`Draft payroll run created for ${targetMonth}`);
      setCreateModalOpen(false);
      reloadRuns();
      if (res?._id || res?.run?._id) setSelectedRunId(res?._id || res?.run?._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payroll run');
    } finally {
      setCreating(false);
    }
  };

  const handleRecompute = async () => {
    if (!selectedRunId) return;
    setRecomputing(true);
    try {
      await payrollApi.recomputeRun(selectedRunId);
      toast.success('Payroll recomputed successfully with latest attendance & tax records');
      reloadCurrentRun();
      reloadRuns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to recompute payroll');
    } finally {
      setRecomputing(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedRunId) return;
    setFinalizing(true);
    try {
      await payrollApi.finalizeRun(selectedRunId);
      toast.success('Payroll RUN FINALIZED! Month is locked and employee payslips published.');
      setFinalizeModalOpen(false);
      reloadCurrentRun();
      reloadRuns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize run');
    } finally {
      setFinalizing(false);
    }
  };

  const runsColumns = [
    {
      key: 'month',
      label: 'Billing Month',
      render: (r) => <span className="font-bold text-xs text-slate-900 dark:text-white">{r.month}</span>,
    },
    {
      key: 'totalEmployees',
      label: 'Employees',
      render: (r) => r.totalEmployees || r.records?.length || 0,
    },
    {
      key: 'totalGross',
      label: 'Total Gross',
      render: (r) => formatCurrency(r.totalGross || 0),
    },
    {
      key: 'totalDeductions',
      label: 'Total Deductions',
      render: (r) => formatCurrency(r.totalDeductions || 0),
    },
    {
      key: 'totalNet',
      label: 'Total Net Disbursement',
      render: (r) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.totalNet || 0)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'finalized' ? 'green' : 'amber'}>
          {r.status?.toUpperCase() || 'DRAFT'}
        </Badge>
      ),
    },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <Button
          variant="secondary"
          className="text-xs py-1 px-2.5"
          onClick={() => setSelectedRunId(r._id)}
        >
          View Breakdown
        </Button>
      ),
    },
  ];

  const breakdownColumns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (item) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">
            {item.employee?.fullName || item.fullName || 'Employee'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">{item.employee?.employeeCode || item.employeeCode || '-'}</p>
        </div>
      ),
    },
    {
      key: 'basicSalary',
      label: 'Basic Salary',
      render: (item) => formatCurrency(item.basicSalary || 0),
    },
    {
      key: 'grossSalary',
      label: 'Gross',
      render: (item) => formatCurrency(item.grossSalary || 0),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (item) => (
        <span className="text-red-600 dark:text-red-400">
          -{formatCurrency((item.deductions?.absentDeduction || 0) + (item.deductions?.latePenalty || 0) + (item.deductions?.unpaidLeaveDeduction || 0))}
        </span>
      ),
    },
    {
      key: 'tax',
      label: 'Income Tax',
      render: (item) => formatCurrency(item.taxDeduction || item.monthlyTax || 0),
    },
    {
      key: 'netSalary',
      label: 'Net Pay',
      render: (item) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.netSalary || 0)}</span>,
    },
  ];

  const activeRun = currentRun?.run || currentRun;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll & Compensation Runs"
        description="Generate monthly compensation drafts, review proration & tax deductions, and lock monthly disbursements."
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Play className="h-4 w-4" />
            <span>Generate Monthly Run</span>
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={reloadRuns} />

      {/* Main Runs Table */}
      <Card title="Monthly Payroll Cycles" description="Historical and active payroll disbursements">
        {!loading && runs.length === 0 ? (
          <EmptyState
            title="No payroll runs generated"
            message="Start by generating a draft payroll run for this month."
            action={<Button onClick={() => setCreateModalOpen(true)}>Generate First Run</Button>}
          />
        ) : (
          <Table columns={runsColumns} rows={runs} loading={loading} />
        )}
      </Card>

      {/* Selected Run Breakdown Drawer / Panel */}
      {selectedRunId && activeRun && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payroll Breakdown: Month {activeRun.month}
                </h3>
                <Badge tone={activeRun.status === 'finalized' ? 'green' : 'amber'}>
                  {activeRun.status === 'finalized' ? 'LOCKED / FINALIZED' : 'DRAFT IN REVIEW'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculations based on 1.5x basic multiplier, working day proration & official tax slabs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeRun.status !== 'finalized' ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleRecompute}
                    loading={recomputing}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Recompute Draft</span>
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="danger"
                      onClick={() => setFinalizeModalOpen(true)}
                      className="text-xs"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>FINALIZE & LOCK MONTH</span>
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Month Locked</span>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Gross</span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(activeRun.totalGross || 0)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Deductions</span>
              <p className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">-{formatCurrency(activeRun.totalDeductions || 0)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Net Payout</span>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(activeRun.totalNet || 0)}</p>
            </div>
          </div>

          {/* Per-Employee Detailed Breakdown */}
          <Table
            columns={breakdownColumns}
            rows={activeRun.records || activeRun.payslips || []}
            loading={runDetailLoading}
          />
        </div>
      )}

      {/* Generate Run Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Generate Monthly Payroll">
        <form onSubmit={handleCreateRun} className="space-y-4 pt-1">
          <Input
            type="month"
            label="Target Month *"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            This will calculate gross salary, attendance deductions (absents, unpaid leaves, late penalties) and monthly income tax for all active employees.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Draft Run
            </Button>
          </div>
        </form>
      </Modal>

      {/* Finalize Confirmation Modal */}
      <Modal open={finalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} title="FINALIZE Monthly Payroll">
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>
              <strong>Warning:</strong> This permanently locks the month of {activeRun?.month}. No further changes, punches or recalculations can be made, and official payslips will be published to employees immediately.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFinalizeModalOpen(false)}>
              Keep as Draft
            </Button>
            <Button variant="danger" onClick={handleFinalize} loading={finalizing}>
              Confirm & Lock Month
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
