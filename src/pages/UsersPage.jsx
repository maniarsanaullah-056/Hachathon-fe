import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useFetch from '../hooks/useFetch.js';
import { usersApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateTime, getErrorMessage, getFieldErrors } from '../utils/format.js';
import { Badge, Button, Card, EmptyState, ErrorBanner, PageHeader } from '../components/ui/Common.jsx';
import { Input } from '../components/ui/Field.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import Table from '../components/ui/Table.jsx';
import TempPasswordModal from '../components/TempPasswordModal.jsx';

export default function UsersPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => usersApi.list(), []);
  const users = data || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [tempInfo, setTempInfo] = useState(null); // { email, password }
  const [confirm, setConfirm] = useState(null); // { type: 'status'|'reset', user }
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm();

  const openCreate = () => {
    reset({ name: '', email: '' });
    setCreateOpen(true);
  };

  const onCreate = async (values) => {
    try {
      const res = await usersApi.createHr(values);
      setCreateOpen(false);
      setTempInfo({ email: res.user.email, password: res.tempPassword });
      toast.success('HR account created');
      reload();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      toast.error(getErrorMessage(err));
    }
  };

  const runConfirmed = async () => {
    setBusy(true);
    try {
      if (confirm.type === 'status') {
        await usersApi.setStatus(confirm.user._id, !confirm.user.isActive);
        toast.success(confirm.user.isActive ? 'Account deactivated' : 'Account activated');
      } else {
        const res = await usersApi.resetPassword(confirm.user._id);
        setTempInfo({ email: confirm.user.email, password: res.tempPassword });
      }
      setConfirm(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (u) => <span className="font-medium text-slate-900">{u.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'isActive', label: 'Status', render: (u) => <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge> },
    { key: 'mustChangePassword', label: 'Password', render: (u) => (u.mustChangePassword ? <Badge tone="amber">Temporary</Badge> : <Badge tone="slate">Set by user</Badge>) },
    { key: 'lastLoginAt', label: 'Last login', render: (u) => formatDateTime(u.lastLoginAt) },
    {
      key: 'actions', label: '', className: 'text-right whitespace-nowrap',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" onClick={() => setConfirm({ type: 'reset', user: u })}>Reset password</Button>
          <Button variant="ghost" className={u.isActive ? 'text-red-600 hover:bg-red-50' : ''} onClick={() => setConfirm({ type: 'status', user: u })}>
            {u.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="HR accounts" description="Only the Admin can create and manage HR logins." actions={<Button onClick={openCreate}>Add HR account</Button>} />
      <Card>
        <ErrorBanner message={error} onRetry={reload} />
        {!error && !loading && users.length === 0 ? (
          <EmptyState title="No HR accounts yet" message="Create an HR account so someone can register and manage employees." action={<Button onClick={openCreate}>Add HR account</Button>} />
        ) : (
          !error && <Table columns={columns} rows={users} loading={loading} />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add HR account" size="sm"
        footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" form="hr-form" loading={isSubmitting}>Create account</Button></>}>
        <form id="hr-form" onSubmit={handleSubmit(onCreate)} className="space-y-4" noValidate>
          <Input label="Full name" required error={errors.name?.message} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
          <p className="text-xs text-slate-500">A secure temporary password is generated. The HR user must change it at first login.</p>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.type === 'reset' ? 'Reset password?' : confirm?.user.isActive ? 'Deactivate account?' : 'Activate account?'}
        message={
          confirm?.type === 'reset'
            ? `A new temporary password will be generated for ${confirm?.user.email}. Their current password stops working immediately.`
            : confirm?.user.isActive
            ? `${confirm?.user.email} will no longer be able to sign in.`
            : `${confirm?.user.email} will be able to sign in again.`
        }
        confirmLabel={confirm?.type === 'reset' ? 'Reset password' : confirm?.user.isActive ? 'Deactivate' : 'Activate'}
        danger={confirm?.type === 'status' && confirm?.user.isActive}
        loading={busy}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />

      <TempPasswordModal open={Boolean(tempInfo)} onClose={() => setTempInfo(null)} email={tempInfo?.email} password={tempInfo?.password} />
    </>
  );
}
