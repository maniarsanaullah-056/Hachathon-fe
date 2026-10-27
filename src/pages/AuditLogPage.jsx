import { useState } from 'react';
import { Shield, Filter, Calendar, User, Eye, ArrowRight, Code } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { auditApi } from '../services/hcmServices.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, EmptyState } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { formatDate } from '../utils/format.js';

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data: auditData, loading, error, reload } = useFetch(
    () => auditApi.list({ action: actionFilter || undefined, entity: entityFilter || undefined }),
    [actionFilter, entityFilter]
  );

  const logs = auditData?.items || auditData?.logs || auditData || [];

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (r) => <span className="font-mono text-xs">{formatDate(r.timestamp || r.createdAt)}</span>,
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{r.actor?.name || r.actorName || 'System'}</p>
          <p className="text-[10px] text-slate-400">{r.actor?.email || r.ipAddress || ''}</p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (r) => <Badge tone="indigo">{r.action?.toUpperCase()}</Badge>,
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (r) => <span className="font-medium text-xs text-slate-700 dark:text-slate-300">{r.entity}</span>,
    },
    {
      key: 'details',
      label: 'Inspect Diff',
      render: (r) => (
        <Button
          variant="secondary"
          className="text-xs py-1 px-2.5"
          onClick={() => setSelectedEntry(r)}
        >
          <Code className="h-3.5 w-3.5" />
          <span>JSON Diff</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail Log"
        description="Immutable system-wide event log recording actions, actors, IP addresses and state modifications."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <Filter className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by Action (e.g. CREATE, UPDATE)..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Filter by Entity (e.g. Employee, Payroll)..."
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <Card title="Activity Stream" description="Read-only append logs">
        {!loading && logs.length === 0 ? (
          <EmptyState
            title="No audit entries found"
            message="No system events match your specified filters."
          />
        ) : (
          <Table columns={columns} rows={logs} loading={loading} />
        )}
      </Card>

      {/* JSON Diff Modal */}
      <Modal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        title="Audit State Diff Inspector"
      >
        {selectedEntry && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Actor:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedEntry.actor?.name || 'System'}</p>
              </div>
              <div>
                <span className="text-slate-400">Action:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedEntry.action} {selectedEntry.entity}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">State Before</p>
                <pre className="max-h-60 overflow-auto font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {JSON.stringify(selectedEntry.before || selectedEntry.previousState || null, null, 2)}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">State After</p>
                <pre className="max-h-60 overflow-auto font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  {JSON.stringify(selectedEntry.after || selectedEntry.newState || selectedEntry.details || null, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
