import { useState } from 'react';
import { Modal } from './ui/Modal.jsx';
import { Badge, Button } from './ui/Common.jsx';
import { employeesApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { downloadBlob, getErrorMessage } from '../utils/format.js';

const TEMPLATE_HEADER = 'employeeCode,fullName,email,department,designation,joiningDate,basicSalary,phone,gender,address';
const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

export default function CsvImportModal({ open, onClose, onImported }) {
  const toast = useToast();
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const resetAll = () => {
    setCsv('');
    setFileName('');
    setAnalysis(null);
    setResult(null);
    setError('');
  };
  const close = () => {
    resetAll();
    onClose();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalysis(null);
    setResult(null);
    setError('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result || ''));
    reader.onerror = () => setError('Could not read the file');
    reader.readAsText(file);
  };

  const validate = async () => {
    setBusy(true);
    setError('');
    try {
      setAnalysis(await employeesApi.importCsv(csv, true));
    } catch (err) {
      setAnalysis(null);
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await employeesApi.importCsv(csv, false);
      setResult(res);
      toast.success(`${res.imported} employees imported`);
      onImported();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => downloadBlob(new Blob([`${TEMPLATE_HEADER}\r\n`], { type: 'text/csv' }), 'employee-import-template.csv');

  const downloadCredentials = () => {
    const lines = ['employeeCode,fullName,email,tempPassword', ...result.credentials.map((c) => [c.employeeCode, c.fullName, c.email, c.tempPassword].map(cell).join(','))];
    downloadBlob(new Blob([lines.join('\r\n')], { type: 'text/csv' }), 'employee-credentials.csv');
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Import employees from CSV"
      footer={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
            <Button variant="secondary" onClick={validate} disabled={!csv} loading={busy && !analysis}>Validate (dry run)</Button>
            <Button onClick={runImport} disabled={!analysis?.canImport} loading={busy && Boolean(analysis)}>
              Import {analysis?.canImport ? `${analysis.validRows} employees` : ''}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {result.imported} employees imported. Temporary passwords are shown <strong>only now</strong>. Download them before closing.
          </div>
          <Button variant="secondary" onClick={downloadCredentials}>Download credentials CSV</Button>
          <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Temp password</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {result.credentials.map((c) => (
                  <tr key={c.employeeCode}><td className="px-3 py-2">{c.employeeCode}</td><td className="px-3 py-2">{c.fullName}</td><td className="px-3 py-2">{c.email}</td><td className="px-3 py-2 font-mono">{c.tempPassword}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-800">Required columns</p>
            <p className="mt-1">employeeCode, fullName, email, department, designation, joiningDate (YYYY-MM-DD), basicSalary. Optional: phone, gender, address.</p>
            <p className="mt-1">Departments and designations must already exist. Maximum 50 rows. Row 1 is the header.</p>
            <button type="button" onClick={downloadTemplate} className="mt-2 font-medium text-indigo-600 hover:underline">Download template</button>
          </div>

          <div>
            <label htmlFor="csv-file" className="mb-1 block text-sm font-medium text-slate-700">CSV file</label>
            <input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFile} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" />
            {fileName && <p className="mt-1 text-xs text-slate-500">{fileName}</p>}
          </div>

          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

          {analysis && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone="slate">{analysis.totalRows} rows</Badge>
                <Badge tone="green">{analysis.validRows} valid</Badge>
                <Badge tone={analysis.invalidRows ? 'red' : 'slate'}>{analysis.invalidRows} invalid</Badge>
              </div>
              {analysis.errors.length === 0 ? (
                <p className="text-sm text-emerald-700">No problems found. Nothing has been saved yet. Click Import to create the employees.</p>
              ) : (
                <div className="max-h-64 overflow-auto rounded-lg border border-red-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-red-50 text-left text-xs uppercase text-red-700"><tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Field</th><th className="px-3 py-2">Reason</th></tr></thead>
                    <tbody className="divide-y divide-red-100">
                      {analysis.errors.map((e, i) => (
                        <tr key={i}><td className="px-3 py-2">{e.row}</td><td className="px-3 py-2 font-mono text-xs">{e.field}</td><td className="px-3 py-2">{e.reason}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
