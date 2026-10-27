import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { correctionsApi } from '../services/hcmServices.js';
import { PageHeader, Badge, Button, ErrorBanner, EmptyState, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Textarea } from '../components/ui/Field.jsx';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function CorrectionsPage() {
  const toast = useToast();
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('approve'); // approve | reject
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: correctionsData, loading, error, reload } = useFetch(
    () => correctionsApi.list(),
    []
  );

  const requests = correctionsData?.items || correctionsData?.corrections || correctionsData || [];

  const handleAction = async () => {
    if (!selectedReq) return;
    setSubmitting(true);
    try {
      if (actionType === 'approve') {
        await correctionsApi.approve(selectedReq._id, comment);
        toast.success('Attendance correction approved');
      } else {
        await correctionsApi.reject(selectedReq._id, comment);
        toast.success('Attendance correction rejected');
      }
      setSelectedReq(null);
      setComment('');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
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
      key: 'date',
      label: 'Date',
      render: (r) => formatDate(r.date),
    },
    {
      key: 'proposed',
      label: 'Proposed Check In / Out',
      render: (r) => (
        <div className="text-xs">
          <span>{r.proposedCheckIn ? new Date(r.proposedCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
          <span className="mx-1 text-slate-400">→</span>
          <span>{r.proposedCheckOut ? new Date(r.proposedCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
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
      label: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              className="text-xs py-1 px-2.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              onClick={() => {
                setSelectedReq(r);
                setActionType('approve');
              }}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              className="text-xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              onClick={() => {
                setSelectedReq(r);
                setActionType('reject');
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Decisioned</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Corrections Inbox"
        description="Review and resolve employee punch missing / biometrics dispute requests."
      />

      <ErrorBanner message={error} onRetry={reload} />

      {!loading && requests.length === 0 ? (
        <EmptyState
          title="No correction requests"
          message="Your inbox is clear! No pending attendance correction tickets."
        />
      ) : (
        <Table columns={columns} rows={requests} loading={loading} />
      )}

      {/* Approve / Reject Modal with Manager Comment */}
      <Modal
        open={Boolean(selectedReq)}
        onClose={() => setSelectedReq(null)}
        title={actionType === 'approve' ? 'Approve Correction Request' : 'Reject Correction Request'}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {actionType === 'approve'
              ? `You are approving the attendance punch correction for ${selectedReq?.employee?.fullName || 'employee'} on ${formatDate(selectedReq?.date)}.`
              : `You are rejecting the attendance punch correction for ${selectedReq?.employee?.fullName || 'employee'}. Please specify a reason.`}
          </p>

          <Textarea
            label="Manager Comment (Optional)"
            placeholder="e.g. Verified biometric failure with security logs..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedReq(null)}>
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
