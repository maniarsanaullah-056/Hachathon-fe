import { useState } from 'react';
import useFetch from '../hooks/useFetch.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage, getFieldErrors } from '../utils/format.js';
import { Button, Card, EmptyState, ErrorBanner } from './ui/Common.jsx';
import { Checkbox, Input, Select, Textarea } from './ui/Field.jsx';
import { ConfirmDialog, Modal } from './ui/Modal.jsx';
import Table from './ui/Table.jsx';

/**
 * Generic list + create/edit modal + delete confirm.
 * fields: [{ name, label, type: text|textarea|number|date|select|checkbox, required, options, hint,
 *            disabledWhen(values), default }]
 */
function initialValues(fields, item) {
  return Object.fromEntries(
    fields.map((f) => {
      let value = item ? item[f.name] : f.default;
      if (f.type === 'select') value = value?._id ?? value ?? '';
      else if (f.type === 'date') value = value ? String(value).slice(0, 10) : '';
      else if (f.type === 'checkbox') value = Boolean(value);
      else if (f.type === 'number') value = value ?? '';
      else value = value ?? '';
      return [f.name, value];
    })
  );
}

function buildPayload(fields, values) {
  return Object.fromEntries(
    fields.map((f) => {
      const v = values[f.name];
      if (f.type === 'number') return [f.name, v === '' || v === null || f.disabledWhen?.(values) ? null : Number(v)];
      if (typeof v === 'string') return [f.name, v.trim()];
      return [f.name, v];
    })
  );
}

export default function CrudSection({ title, description, itemName, api, columns, fields, emptyMessage, emptyAction, listParams, extraActions }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.list(listParams), [JSON.stringify(listParams || {})]);
  const items = data || [];

  const [editing, setEditing] = useState(null); // null = closed, {} = create, item = edit
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const open = (item) => {
    setEditing(item || {});
    setValues(initialValues(fields, item));
    setFieldErrors({});
  };
  const close = () => setEditing(null);
  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = buildPayload(fields, values);
      if (editing?._id) await api.update(editing._id, payload);
      else await api.create(payload);
      toast.success(`${itemName} ${editing?._id ? 'updated' : 'created'}`);
      close();
      reload();
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.remove(deleting._id);
      toast.success(`${itemName} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const allColumns = [
    ...columns,
    {
      key: '_actions',
      label: '',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" onClick={() => open(row)}>Edit</Button>
          <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={title}
      description={description}
      actions={
        <>
          {extraActions}
          <Button onClick={() => open()}>Add {itemName.toLowerCase()}</Button>
        </>
      }
    >
      <ErrorBanner message={error} onRetry={reload} />
      {!error && !loading && items.length === 0 ? (
        <EmptyState title={`No ${itemName.toLowerCase()}s yet`} message={emptyMessage} action={emptyAction} />
      ) : (
        !error && <Table columns={allColumns} rows={items} loading={loading} />
      )}

      <Modal
        open={editing !== null}
        onClose={close}
        title={`${editing?._id ? 'Edit' : 'Add'} ${itemName.toLowerCase()}`}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={saving}>Cancel</Button>
            <Button type="submit" form="crud-form" loading={saving}>Save</Button>
          </>
        }
      >
        <form id="crud-form" onSubmit={save} className="space-y-4" noValidate>
          {fields.map((f) => {
            const common = { name: f.name, label: f.label, required: f.required, hint: f.hint, error: fieldErrors[f.name] };
            const disabled = f.disabledWhen?.(values) || false;
            if (f.type === 'textarea') return <Textarea key={f.name} {...common} value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />;
            if (f.type === 'checkbox') return <Checkbox key={f.name} name={f.name} label={f.label} hint={f.hint} checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} />;
            if (f.type === 'select')
              return (
                <Select key={f.name} {...common} value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                  <option value="">{f.placeholder || 'Select...'}</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              );
            return (
              <Input
                key={f.name}
                {...common}
                type={f.type || 'text'}
                step={f.type === 'number' ? 'any' : undefined}
                disabled={disabled}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            );
          })}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${itemName.toLowerCase()}?`}
        message={`This will permanently delete "${deleting?.name || deleting?.title || ''}". This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
}
