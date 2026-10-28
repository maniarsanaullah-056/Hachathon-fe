import { useState } from 'react';
import { Sparkles, Calendar, Plus, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { leaveApi, aiApi } from '../services/hcmServices.js';
import { leaveTypesApi } from '../services/orgService.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, Spinner, EmptyState, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../components/ui/Field.jsx';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function LeavePage() {
  const toast = useToast();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [nlpText, setNlpText] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [aiBanner, setAiBanner] = useState(false);

  // Form Fields
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch balances, leave types, and own requests
  const { data: balanceData, reload: reloadBalance } = useFetch(() => leaveApi.getBalance(), []);
  const { data: leaveTypes } = useFetch(() => leaveTypesApi.list(), []);
  const { data: myLeavesData, loading, error, reload: reloadLeaves } = useFetch(() => leaveApi.list(), []);

  const balances = balanceData?.balances || balanceData || [];
  const myLeaves = myLeavesData?.leaves || myLeavesData?.items || myLeavesData || [];
  const typeList = leaveTypes || [];

  // NLP Smart Leave parser
  const handleSmartLeaveParse = async (e) => {
    e.preventDefault();
    if (!nlpText.trim()) return;
    setNlpLoading(true);
    try {
      const res = await aiApi.smartLeave(nlpText);
      const parsed = res?.data || res;

      if (parsed) {
        if (parsed.start || parsed.startDate) setStartDate(parsed.start || parsed.startDate);
        if (parsed.end || parsed.endDate) setEndDate(parsed.end || parsed.endDate);
        if (parsed.reason) setReason(parsed.reason);
        
        // Match leave type title loosely
        if (parsed.type) {
          const match = typeList.find(t => t.name.toLowerCase().includes(parsed.type.toLowerCase()));
          if (match) setLeaveTypeId(match._id);
        }
        setAiBanner(true);
        setApplyModalOpen(true);
        toast.success('Form pre-filled by AI. Please review and confirm!');
      }
    } catch {
      toast.error('Could not interpret sentence. Please fill the normal form.');
      setApplyModalOpen(true);
    } finally {
      setNlpLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate) {
      toast.error('Please complete all mandatory fields');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.apply({
        leaveTypeId,
        startDate,
        endDate,
        reason,
      });
      toast.success('Leave application submitted for approval');
      setApplyModalOpen(false);
      setAiBanner(false);
      setNlpText('');
      setReason('');
      reloadLeaves();
      reloadBalance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await leaveApi.cancel(id);
      toast.success('Leave application cancelled');
      reloadLeaves();
      reloadBalance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel application');
    }
  };

  // Calculate working days preview between dates
  const calcDaysPreview = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    let count = 0;
    let cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // skips standard weekend
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const columns = [
    {
      key: 'type',
      label: 'Leave Type',
      render: (r) => <span className="font-semibold text-xs text-slate-900 dark:text-white">{r.leaveType?.name || r.type || 'Leave'}</span>,
    },
    {
      key: 'dates',
      label: 'Duration',
      render: (r) => (
        <span className="text-xs">
          {formatDate(r.startDate)} - {formatDate(r.endDate)} ({r.daysCount || r.days || 1} days)
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (r) => <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{r.reason || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status?.toUpperCase()}</Badge>,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (r) =>
        r.status === 'pending' ? (
          <Button
            variant="ghost"
            className="text-xs text-red-600 hover:text-red-700 p-1"
            onClick={() => handleCancel(r._id)}
          >
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Center"
        description="View remaining quotas, apply for time off with AI assistance, and monitor approval states."
        actions={
          <Button onClick={() => setApplyModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Apply Leave</span>
          </Button>
        }
      />

      {/* Smart Leave NLP Box */}
      <div className="rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/5 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Smart AI Leave Assistant
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Type naturally in plain English or Roman Urdu, e.g. "Need next Monday and Tuesday off for family wedding"
        </p>

        <form onSubmit={handleSmartLeaveParse} className="flex gap-2">
          <input
            type="text"
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder="Type your leave request sentence..."
            disabled={nlpLoading}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <Button
            type="submit"
            loading={nlpLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            <span>Auto Fill</span>
          </Button>
        </form>
      </div>

      {/* Real-time Quotas Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((b, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">{b.name}</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{b.remaining ?? b.balance ?? 0}</span>
              <span className="text-xs text-slate-400">/ {b.quota || b.yearlyQuota || 12} days</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Available balance</p>
          </div>
        ))}
      </div>

      <ErrorBanner message={error} onRetry={reloadLeaves} />

      {/* History Table */}
      <Card title="My Leave History" description="All approved, pending and past time off applications">
        {!loading && myLeaves.length === 0 ? (
          <EmptyState
            title="No leave applications"
            message="You haven't submitted any leave applications yet."
            action={<Button onClick={() => setApplyModalOpen(true)}>Apply for leave</Button>}
          />
        ) : (
          <Table columns={columns} rows={myLeaves} loading={loading} />
        )}
      </Card>

      {/* Application Modal */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Apply for Leave">
        {aiBanner && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-teal-50 dark:bg-teal-950/40 p-3 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4" /> AI Suggestion pre-filled. Please review and confirm before submitting.
            </span>
            <button type="button" onClick={() => setAiBanner(false)} className="text-teal-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4 pt-1">
          <Select
            label="Leave Type *"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            required
          >
            <option value="">Select leave type</option>
            {typeList.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} (Quota: {t.yearlyQuota} days)
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date *"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="date"
              label="End Date *"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {startDate && endDate && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs flex justify-between">
              <span className="text-slate-500">Calculated Working Days:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{calcDaysPreview()} days</span>
            </div>
          )}

          <Textarea
            label="Reason for Leave *"
            placeholder="Please provide context for your manager..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
