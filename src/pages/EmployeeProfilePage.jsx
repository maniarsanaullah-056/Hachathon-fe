import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch.js';
import { departmentsApi, designationsApi } from '../services/orgService.js';
import { employeesApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDate, formatDateTime, getErrorMessage, toInputDate } from '../utils/format.js';
import { Badge, Button, Card, ErrorBanner, PageHeader, Spinner, statusTone } from '../components/ui/Common.jsx';
import { Input, Select } from '../components/ui/Field.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import EmployeeFormModal from '../components/EmployeeFormModal.jsx';
import TempPasswordModal from '../components/TempPasswordModal.jsx';

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children || '-'}</dd>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => employeesApi.get(id), [id]);
  const { data: departments } = useFetch(() => departmentsApi.list(), []);
  const { data: designations } = useFetch(() => designationsApi.list(), []);

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('active');
  const [exitDate, setExitDate] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  const { employee: e, account } = data;

  const openStatus = () => {
    setNewStatus(e.employmentStatus);
    setExitDate(toInputDate(e.exitDate));
    setStatusOpen(true);
  };

  const saveStatus = async () => {
    setBusy(true);
    try {
      await employeesApi.setStatus(id, { status: newStatus, exitDate: newStatus === 'terminated' && exitDate ? exitDate : undefined });
      toast.success(`Employee marked ${newStatus}`);
      setStatusOpen(false);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const doReset = async () => {
    setBusy(true);
    try {
      const res = await employeesApi.resetPassword(id);
      setResetOpen(false);
      setTempPassword(res.tempPassword);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setResetOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        backTo="/employees"
        title={e.fullName}
        description={`${e.employeeCode} · ${e.designation?.title || ''} · ${e.department?.name || ''}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(true)}>Reset password</Button>
            <Button variant="secondary" onClick={openStatus}>Change status</Button>
            <Button onClick={() => setEditOpen(true)}>Edit</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Personal details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Full name">{e.fullName}</Item>
            <Item label="Email">{e.email}</Item>
            <Item label="Phone">{e.phone}</Item>
            <Item label="Gender">{e.gender ? e.gender[0].toUpperCase() + e.gender.slice(1) : ''}</Item>
            <div className="sm:col-span-2"><Item label="Address">{e.address}</Item></div>
          </dl>
        </Card>

        <Card title="Employment">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Employee code">{e.employeeCode}</Item>
            <Item label="Status"><Badge tone={statusTone(e.employmentStatus)}>{e.employmentStatus}</Badge></Item>
            <Item label="Department">{e.department?.name}</Item>
            <Item label="Designation">{e.designation?.title}</Item>
            <Item label="Joining date">{formatDate(e.joiningDate)}</Item>
            <Item label="Exit date">{e.exitDate ? formatDate(e.exitDate) : ''}</Item>
          </dl>
        </Card>

        <Card title="Compensation" description="Visible to Admin and HR only">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Basic salary (monthly)">{formatCurrency(e.basicSalary)}</Item>
          </dl>
          <p className="mt-4 text-xs text-slate-500">Full salary structure, payroll and payslips arrive in Phase 5.</p>
        </Card>

        <Card title="Login account">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Account"><Badge tone={account?.isActive ? 'green' : 'red'}>{account?.isActive ? 'Active' : 'Disabled'}</Badge></Item>
            <Item label="Password">{account?.mustChangePassword ? 'Temporary (change pending)' : 'Set by employee'}</Item>
            <Item label="Last login">{formatDateTime(account?.lastLoginAt)}</Item>
          </dl>
        </Card>

        <Card title="Attendance & leave" className="lg:col-span-2">
          <p className="text-sm text-slate-500">Attendance history (Phase 3), leave balances (Phase 4) and payslips (Phase 5) will appear on this profile.</p>
        </Card>
      </div>

      <EmployeeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        employee={e}
        departments={departments || []}
        designations={designations || []}
        onSaved={() => { setEditOpen(false); reload(); }}
      />

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Change employment status" size="sm"
        footer={<><Button variant="secondary" onClick={() => setStatusOpen(false)} disabled={busy}>Cancel</Button><Button variant={newStatus === 'active' ? 'primary' : 'danger'} onClick={saveStatus} loading={busy}>Update status</Button></>}>
        <div className="space-y-4">
          <Select label="Status" name="status" value={newStatus} onChange={(ev) => setNewStatus(ev.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated (left company)</option>
          </Select>
          {newStatus === 'terminated' && <Input label="Exit date" type="date" name="exitDate" value={exitDate} onChange={(ev) => setExitDate(ev.target.value)} hint="Leave empty to use today" />}
          {newStatus !== 'active' && <p className="text-xs text-red-600">The employee will not be able to sign in while inactive or terminated.</p>}
        </div>
      </Modal>

      <ConfirmDialog open={resetOpen} title="Reset password?" message={`A new temporary password will be generated for ${e.email}. Their current password stops working immediately.`} confirmLabel="Reset password" loading={busy} onConfirm={doReset} onCancel={() => setResetOpen(false)} />
      <TempPasswordModal open={Boolean(tempPassword)} onClose={() => setTempPassword(null)} email={e.email} password={tempPassword} />
    </>
  );
}
