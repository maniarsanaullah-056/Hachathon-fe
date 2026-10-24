import { useState } from 'react';
import useFetch from '../hooks/useFetch.js';
import CrudSection from '../components/CrudSection.jsx';
import { departmentsApi, designationsApi } from '../services/orgService.js';
import { PageHeader } from '../components/ui/Common.jsx';

const DEPARTMENT_FIELDS = [
  { name: 'name', label: 'Department name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function OrganizationPage() {
  const [tab, setTab] = useState('departments');
  const { data: departments } = useFetch(() => departmentsApi.list(), [tab]);

  const designationFields = [
    { name: 'title', label: 'Designation title', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'select', placeholder: 'No specific department', options: (departments || []).map((d) => ({ value: d._id, label: d.name })), hint: 'Optional' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const tabs = [
    { id: 'departments', label: 'Departments' },
    { id: 'designations', label: 'Designations' },
  ];

  return (
    <>
      <PageHeader title="Departments & designations" description="Employees are assigned to a department and a designation." />
      <div className="mb-4 flex gap-1 border-b border-slate-200" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' ? (
        <CrudSection
          title="Departments"
          itemName="Department"
          api={departmentsApi}
          fields={DEPARTMENT_FIELDS}
          emptyMessage="Create your first department, e.g. Engineering or Finance."
          columns={[
            { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
            { key: 'description', label: 'Description', render: (r) => r.description || '-' },
          ]}
        />
      ) : (
        <CrudSection
          title="Designations"
          itemName="Designation"
          api={designationsApi}
          fields={designationFields}
          emptyMessage="Create job titles such as Software Engineer or HR Manager."
          columns={[
            { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
            { key: 'department', label: 'Department', render: (r) => r.department?.name || '-' },
            { key: 'description', label: 'Description', render: (r) => r.description || '-' },
          ]}
        />
      )}
    </>
  );
}
