import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch.js';
import { employeesApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, getErrorMessage, getFieldErrors } from '../utils/format.js';
import { Button, Card, ErrorBanner, PageHeader, Spinner } from '../components/ui/Common.jsx';
import { Input, Textarea } from '../components/ui/Field.jsx';

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children || '-'}</dd>
    </div>
  );
}

export default function MyProfilePage() {
  const toast = useToast();
  const { data: me, loading, error, reload } = useFetch(() => employeesApi.me(), []);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) setForm({ phone: me.phone || '', address: me.address || '' });
  }, [me]);

  if (loading && !me) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  const save = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      // Employee sirf phone aur address badal sakta hai
      await employeesApi.updateMe({ phone: form.phone.trim(), address: form.address.trim() });
      toast.success('Profile updated');
      reload();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="My profile" description="You can update your phone number and address. Other details are managed by HR." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Employment details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Name">{me.fullName}</Item>
            <Item label="Employee code">{me.employeeCode}</Item>
            <Item label="Email">{me.email}</Item>
            <Item label="Department">{me.department?.name}</Item>
            <Item label="Designation">{me.designation?.title}</Item>
            <Item label="Joining date">{formatDate(me.joiningDate)}</Item>
          </dl>
        </Card>

        <form onSubmit={save} noValidate>
          <Card title="Contact details" actions={<Button type="submit" loading={saving}>Save</Button>}>
            <div className="space-y-4">
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} error={errors.phone} />
              <Textarea label="Address" name="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} error={errors.address} />
              <Link to="/change-password" className="inline-block text-sm font-medium text-indigo-600 hover:underline">Change my password</Link>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
