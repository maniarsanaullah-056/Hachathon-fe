import { useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Filter, MessageSquare } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { leaveApi } from '../services/hcmServices.js';
import { PageHeader, Badge, Button, ErrorBanner, EmptyState, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Textarea } from '../components/ui/Field.jsx';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function LeaveApprovalsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending'); // pending | all
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: leavesData, loading, error, reload } = useFetch(
    () => leaveApi.list(activeTab === 'pending' ? { status: 'pending' } : {}),
    [activeTab]
  );

  const leaves = leavesData?.leaves || leavesData?.items || leavesData || [];

  const handleAction = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      if (actionType === 'approve') {
        await leaveApi.approve(selectedLeave._id, comment);
        toast.success('Leave application approved');
      } else {
        await leaveApi.reject(selectedLeave._id, comment);
        toast.success('Leave application rejected');
      }
      setSelectedLeave(null);
      setComment('');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process decision');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">
            {r.employee?.fullName || r.employeeName || 'Employee'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">{r.employee?.employeeCode || '-'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (r) => <Badge tone="indigo">{r.leaveType?.name || r.type || 'Leave'}</Badge>,
    },
    {
      key: 'duration',
      label: 'Dates & Days',
      render: (r) => (
        <div className="text-xs">
          <span>{formatDate(r.startDate)} - {formatDate(r.endDate)}</span>
          <span className="block text-[10px] text-slate-400 font-semibold">{r.daysCount || r.days || 1} working days</span>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (r) => <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{r.reason}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status?.toUpperCase()}</Badge>,
    },
    {
      key: 'actions',
      label: 'Decision',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              className="text-xs py-1 px-2.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              onClick={() => {
                setSelectedLeave(r);
                setActionType('approve');
              }}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              className="text-xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              onClick={() => {
                setSelectedLeave(r);
                setActionType('reject');
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Processed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals Inbox"
        description="Review time-off requests, check balance collisions and communicate managerial decisions."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Full History
        </button>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {!loading && leaves.length === 0 ? (
        <EmptyState
          title={activeTab === 'pending' ? 'No pending leave requests' : 'No leave history'}
          message="All employee time off requests are up to date."
        />
      ) : (
        <Table columns={columns} rows={leaves} loading={loading} />
      )}

      {/* Modal Decision */}
      <Modal
        open={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title={actionType === 'approve' ? 'Approve Time Off Request' : 'Reject Time Off Request'}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {actionType === 'approve'
              ? `Approve leave for ${selectedLeave?.employee?.fullName || 'employee'} from ${formatDate(selectedLeave?.startDate)} to ${formatDate(selectedLeave?.endDate)}.`
              : `Reject leave request for ${selectedLeave?.employee?.fullName || 'employee'}. A feedback comment will be sent to the employee.`}
          </p>

          <Textarea
            label="Manager Comment (Optional)"
            placeholder="e.g. Approved. Please ensure handover before leaving..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedLeave(null)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'primary' : 'danger'}
              onClick={handleAction}
              loading={submitting}
            >
              Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
