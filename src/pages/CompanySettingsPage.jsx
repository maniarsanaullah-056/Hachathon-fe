import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch.js';
import { companyApi } from '../services/orgService.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage, getFieldErrors } from '../utils/format.js';
import { Button, Card, ErrorBanner, PageHeader, Spinner } from '../components/ui/Common.jsx';
import { Checkbox, Input, Textarea } from '../components/ui/Field.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timezones = (() => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['Asia/Karachi', 'UTC'];
  }
})();

export default function CompanySettingsPage() {
  const toast = useToast();
  const { data: company, loading, error, reload } = useFetch(() => companyApi.get(), []);
  const [form, setForm] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingPolicies, setSavingPolicies] = useState(false);

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name,
      timezone: company.timezone,
      officeStartTime: company.officeStartTime,
      officeEndTime: company.officeEndTime,
      graceMinutes: company.graceMinutes,
      halfDayThresholdHours: company.halfDayThresholdHours,
      weekendDays: [...company.weekendDays],
      latitude: company.officeLocation?.latitude ?? '',
      longitude: company.officeLocation?.longitude ?? '',
      radiusMeters: company.officeLocation?.radiusMeters ?? 200,
    });
    setPolicies((company.policies || []).map((p) => ({ title: p.title, content: p.content })));
  }, [company]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (!form) return null;

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const toggleDay = (day) =>
    set('weekendDays', form.weekendDays.includes(day) ? form.weekendDays.filter((d) => d !== day) : [...form.weekendDays, day].sort());
  const num = (v) => (v === '' || v === null ? null : Number(v));

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await companyApi.update({
        name: form.name.trim(),
        timezone: form.timezone,
        officeStartTime: form.officeStartTime,
        officeEndTime: form.officeEndTime,
        graceMinutes: Number(form.graceMinutes),
        halfDayThresholdHours: Number(form.halfDayThresholdHours),
        weekendDays: form.weekendDays,
        officeLocation: { latitude: num(form.latitude), longitude: num(form.longitude), radiusMeters: num(form.radiusMeters) ?? 200 },
      });
      toast.success('Company settings saved');
      reload();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePolicies = async () => {
    setSavingPolicies(true);
    try {
      await companyApi.updatePolicies(policies.map((p) => ({ title: p.title.trim(), content: p.content.trim() })));
      toast.success('Policies saved');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPolicies(false);
    }
  };

  const setPolicy = (i, key, value) => setPolicies((list) => list.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  return (
    <>
      <PageHeader title="Company settings" description="These rules apply to all new attendance and leave calculations." />
      <div className="space-y-6">
        <form onSubmit={saveSettings} noValidate>
          <Card title="Organization & working hours" actions={<Button type="submit" loading={saving}>Save settings</Button>}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Company name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <div>
                <Input label="Timezone" required list="tz-list" value={form.timezone} onChange={(e) => set('timezone', e.target.value)} error={errors.timezone} hint="IANA timezone, e.g. Asia/Karachi" />
                <datalist id="tz-list">{timezones.map((tz) => <option key={tz} value={tz} />)}</datalist>
              </div>
              <Input label="Office start time" type="time" required value={form.officeStartTime} onChange={(e) => set('officeStartTime', e.target.value)} error={errors.officeStartTime} />
              <Input label="Office end time" type="time" required value={form.officeEndTime} onChange={(e) => set('officeEndTime', e.target.value)} error={errors.officeEndTime} />
              <Input label="Grace period (minutes)" type="number" min="0" max="120" value={form.graceMinutes} onChange={(e) => set('graceMinutes', e.target.value)} error={errors.graceMinutes} hint="Late if check-in is after start time + grace" />
              <Input label="Half-day threshold (hours)" type="number" min="0" max="12" step="0.5" value={form.halfDayThresholdHours} onChange={(e) => set('halfDayThresholdHours', e.target.value)} error={errors.halfDayThresholdHours} hint="Work below this many hours counts as a half-day" />
            </div>

            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium text-slate-700">Weekend days</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {DAYS.map((name, idx) => (
                  <Checkbox key={name} name={`day-${idx}`} label={name} checked={form.weekendDays.includes(idx)} onChange={() => toggleDay(idx)} />
                ))}
              </div>
              {errors.weekendDays && <p role="alert" className="mt-1 text-xs text-red-600">{errors.weekendDays}</p>}
            </fieldset>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Office location (optional)</h3>
              <p className="mb-3 text-xs text-slate-500">Used later for location-verified attendance. Leave empty to skip.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} error={errors['officeLocation.latitude']} />
                <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} error={errors['officeLocation.longitude']} />
                <Input label="Allowed radius (meters)" type="number" min="10" max="5000" value={form.radiusMeters} onChange={(e) => set('radiusMeters', e.target.value)} error={errors['officeLocation.radiusMeters']} />
              </div>
            </div>
          </Card>
        </form>

        <Card
          title="Company policies"
          description="The AI assistant will answer policy questions only from what you write here."
          actions={
            <>
              <Button variant="secondary" onClick={() => setPolicies((p) => [...p, { title: '', content: '' }])}>Add policy</Button>
              <Button onClick={savePolicies} loading={savingPolicies}>Save policies</Button>
            </>
          }
        >
          {policies.length === 0 ? (
            <p className="text-sm text-slate-500">No policies yet. Add one, then save.</p>
          ) : (
            <div className="space-y-4">
              {policies.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <Input label={`Policy ${i + 1} title`} value={p.title} onChange={(e) => setPolicy(i, 'title', e.target.value)} />
                  <div className="mt-3"><Textarea label="Content" rows={4} value={p.content} onChange={(e) => setPolicy(i, 'content', e.target.value)} /></div>
                  <button type="button" onClick={() => setPolicies((list) => list.filter((_, idx) => idx !== i))} className="mt-2 text-sm text-red-600 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
