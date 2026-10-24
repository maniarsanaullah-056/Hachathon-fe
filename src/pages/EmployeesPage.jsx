import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch.js';
import { departmentsApi, designationsApi } from '../services/orgService.js';
import { employeesApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { downloadBlob, formatDate, getErrorMessage } from '../utils/format.js';
import { Badge, Button, EmptyState, ErrorBanner, PageHeader, statusTone } from '../components/ui/Common.jsx';
import { Input, Select } from '../components/ui/Field.jsx';
import Table from '../components/ui/Table.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmployeeFormModal from '../components/EmployeeFormModal.jsx';
import CsvImportModal from '../components/CsvImportModal.jsx';
import TempPasswordModal from '../components/TempPasswordModal.jsx';

const SORTS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'fullName:asc', label: 'Name A-Z' },
  { value: 'fullName:desc', label: 'Name Z-A' },
  { value: 'employeeCode:asc', label: 'Employee code' },
  { value: 'joiningDate:asc', label: 'Joining date (oldest)' },
  { value: 'joiningDate:desc', label: 'Joining date (newest)' },
];

// Khali filters params se hata deta hai
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

export default function EmployeesPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tempInfo, setTempInfo] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Search 400ms ruk kar chalta hai (har key par API call nahi)
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const [sortBy, order] = sort.split(':');
  const filters = clean({ q, department, designation, status, sortBy, order });

  const { data, loading, error, reload } = useFetch(
    () => employeesApi.list({ ...filters, page, limit: 10 }),
    [q, department, designation, status, sort, page]
  );
  const { data: departments } = useFetch(() => departmentsApi.list(), []);
  const { data: designations } = useFetch(() => designationsApi.list(), []);

  const items = data?.items || [];
  const deptList = departments || [];
  const desigList = designations || [];
  const needsSetup = departments && designations && (deptList.length === 0 || desigList.length === 0);
  const hasFilters = Boolean(q || department || designation || status);

  const change = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await employeesApi.exportCsv(clean({ q, department, designation, status }));
      downloadBlob(blob, `employees-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const onSaved = (res) => {
    setFormOpen(false);
    if (res.tempPassword) setTempInfo({ email: res.employee.email, password: res.tempPassword });
    reload();
  };

  const columns = [
    { key: 'employeeCode', label: 'Code', render: (e) => <span className="font-mono text-xs">{e.employeeCode}</span> },
    { key: 'fullName', label: 'Name', render: (e) => <Link to={`/employees/${e._id}`} className="font-medium text-indigo-600 hover:underline">{e.fullName}</Link> },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department', render: (e) => e.department?.name || '-' },
    { key: 'designation', label: 'Designation', render: (e) => e.designation?.title || '-' },
    { key: 'joiningDate', label: 'Joined', render: (e) => formatDate(e.joiningDate) },
    { key: 'employmentStatus', label: 'Status', render: (e) => <Badge tone={statusTone(e.employmentStatus)}>{e.employmentStatus}</Badge> },
  ];

  return (
    <>
      <PageHeader
        title="Employees"
        description="Register, search and manage employees."
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(true)} disabled={needsSetup}>Import CSV</Button>
            <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
            <Button onClick={() => setFormOpen(true)} disabled={needsSetup}>Add employee</Button>
          </>
        }
      />

      {needsSetup && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create at least one department and one designation before registering employees.{' '}
          <Link to="/organization" className="font-medium underline">Go to Departments & Designations</Link>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2"><Input aria-label="Search employees" name="search" placeholder="Search name, email or code" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select aria-label="Department filter" name="department" value={department} onChange={change(setDepartment)}>
          <option value="">All departments</option>
          {deptList.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </Select>
        <Select aria-label="Status filter" name="status" value={status} onChange={change(setStatus)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </Select>
        <Select aria-label="Sort" name="sort" value={sort} onChange={change(setSort)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Select aria-label="Designation filter" name="designation" value={designation} onChange={change(setDesignation)}>
          <option value="">All designations</option>
          {desigList.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}
        </Select>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      {!error && !loading && items.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No employees match your filters' : 'No employees yet'}
          message={hasFilters ? 'Try clearing the search or filters.' : 'Register your first employee or import a CSV file.'}
          action={!hasFilters && !needsSetup && <Button onClick={() => setFormOpen(true)}>Add employee</Button>}
        />
      ) : (
        !error && (
          <>
            <Table columns={columns} rows={items} loading={loading} />
            <Pagination pagination={data?.pagination} onChange={setPage} />
          </>
        )
      )}

      <EmployeeFormModal open={formOpen} onClose={() => setFormOpen(false)} departments={deptList} designations={desigList} onSaved={onSaved} />
      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={reload} />
      <TempPasswordModal open={Boolean(tempInfo)} onClose={() => setTempInfo(null)} title="Employee login created" email={tempInfo?.email} password={tempInfo?.password} />
    </>
  );
}
