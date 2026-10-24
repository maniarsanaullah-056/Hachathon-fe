import { useState } from 'react';
import CrudSection from '../components/CrudSection.jsx';
import { holidaysApi, leaveTypesApi } from '../services/orgService.js';
import { Badge, Button, PageHeader } from '../components/ui/Common.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, getErrorMessage } from '../utils/format.js';

const LEAVE_TYPE_FIELDS = [
  { name: 'name', label: 'Leave type name', type: 'text', required: true },
  { name: 'code', label: 'Code', type: 'text', required: true, hint: 'Short code, e.g. ANNUAL' },
  { name: 'isUnlimited', label: 'Unlimited quota', type: 'checkbox', default: false },
  { name: 'yearlyQuota', label: 'Yearly quota (days)', type: 'number', disabledWhen: (v) => v.isUnlimited, hint: 'Ignored when unlimited' },
  { name: 'isPaid', label: 'Paid leave', type: 'checkbox', default: true },
  { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const HOLIDAY_FIELDS = [
  { name: 'name', label: 'Holiday name', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
];

export default function LeaveSettingsPage() {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const loadDefaults = async () => {
    setLoadingDefaults(true);
    try {
      const res = await leaveTypesApi.loadDefaults();
      toast.success(res.created ? 'Default leave types created' : 'Leave types already exist');
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingDefaults(false);
    }
  };

  return (
    <>
      <PageHeader title="Leave types & holidays" description="Weekends and public holidays are excluded from leave day calculations." />
      <div className="space-y-6">
        <CrudSection
          key={version}
          title="Leave types"
          description="Yearly quotas apply to every employee."
          itemName="Leave type"
          api={leaveTypesApi}
          fields={LEAVE_TYPE_FIELDS}
          emptyMessage="Load the standard set (Annual 14, Sick 8, Casual 10, Unpaid unlimited) or add your own."
          emptyAction={<Button onClick={loadDefaults} loading={loadingDefaults}>Load default leave types</Button>}
          columns={[
            { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
            { key: 'code', label: 'Code' },
            { key: 'yearlyQuota', label: 'Yearly quota', render: (r) => (r.isUnlimited ? 'Unlimited' : `${r.yearlyQuota} days`) },
            { key: 'isPaid', label: 'Type', render: (r) => <Badge tone={r.isPaid ? 'green' : 'amber'}>{r.isPaid ? 'Paid' : 'Unpaid'}</Badge> },
            { key: 'isActive', label: 'Status', render: (r) => <Badge tone={r.isActive ? 'green' : 'slate'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
          ]}
        />

        <CrudSection
          title="Public holidays"
          itemName="Holiday"
          api={holidaysApi}
          fields={HOLIDAY_FIELDS}
          emptyMessage="Add public holidays so they are not counted as working days."
          columns={[
            { key: 'name', label: 'Holiday', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
            { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
            { key: 'day', label: 'Day', render: (r) => new Date(r.date).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }) },
          ]}
        />
      </div>
    </>
  );
}
