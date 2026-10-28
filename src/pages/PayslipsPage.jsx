import { useState } from 'react';
import { Download, FileText, Eye, DollarSign, Calendar } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { payrollApi } from '../services/hcmServices.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, EmptyState, statusTone } from '../components/ui/Common.jsx';
import Table from '../components/ui/Table.jsx';
import Modal from '../components/ui/Modal.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function PayslipsPage() {
  const toast = useToast();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: payslipsData, loading, error, reload } = useFetch(
    () => payrollApi.listPayslips(),
    []
  );

  const payslips = payslipsData?.payslips || payslipsData?.items || payslipsData || [];

  const handleDownloadPdf = async (slip) => {
    setDownloadingId(slip._id);
    try {
      await payrollApi.downloadPayslipPdf(slip._id, `payslip-${slip.month || 'statement'}.pdf`);
      toast.success('Payslip downloaded');
    } catch (err) {
      toast.error('Failed to download PDF payslip');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      key: 'month',
      label: 'Month',
      render: (r) => <span className="font-bold text-xs text-slate-900 dark:text-white">{r.month}</span>,
    },
    {
      key: 'gross',
      label: 'Gross Salary',
      render: (r) => formatCurrency(r.grossSalary || 0),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (r) => <span className="text-red-600 dark:text-red-400">-{formatCurrency((r.totalDeductions || r.deductions?.total || 0) + (r.taxDeduction || 0))}</span>,
    },
    {
      key: 'net',
      label: 'Net Pay',
      render: (r) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.netSalary || 0)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge tone="green">FINALIZED</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="text-xs py-1 px-2.5"
            onClick={() => setSelectedSlip(r)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
          <Button
            variant="secondary"
            className="text-xs py-1 px-2.5 text-indigo-600 dark:text-indigo-400"
            onClick={() => handleDownloadPdf(r)}
            loading={downloadingId === r._id}
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payslips & Tax Statements"
        description="View finalized monthly wage calculations, proration allowances and download official PDF payslips."
      />

      <ErrorBanner message={error} onRetry={reload} />

      <Card title="Monthly Salary Statements" description="Published records from finalized payroll cycles">
        {!loading && payslips.length === 0 ? (
          <EmptyState
            title="No payslips published yet"
            message="Your payslips will be available here once the monthly payroll run is finalized by Admin."
          />
        ) : (
          <Table columns={columns} rows={payslips} loading={loading} />
        )}
      </Card>

      {/* Payslip Detail Modal */}
      <Modal
        open={Boolean(selectedSlip)}
        onClose={() => setSelectedSlip(null)}
        title={`Payslip Statement: ${selectedSlip?.month}`}
      >
        {selectedSlip && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Header section */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedSlip.employee?.fullName || 'Employee'}</p>
                <p className="text-[11px] text-slate-400">{selectedSlip.employee?.employeeCode} • {selectedSlip.employee?.designation?.title || 'Staff'}</p>
              </div>
              <Badge tone="green">PAID</Badge>
            </div>

            {/* Salary Breakdown Rows */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Basic Salary:</span>
                <span className="font-semibold">{formatCurrency(selectedSlip.basicSalary || 0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">House Rent Allowance (HRA 40%):</span>
                <span className="font-semibold">{formatCurrency(selectedSlip.hraAllowance || 0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Medical Allowance (10%):</span>
                <span className="font-semibold">{formatCurrency(selectedSlip.medicalAllowance || 0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>Total Gross:</span>
                <span className="text-indigo-600">{formatCurrency(selectedSlip.grossSalary || 0)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">Deductions & Taxes</span>
              <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
                <span>Absent / Unpaid Leave:</span>
                <span>-{formatCurrency(selectedSlip.deductions?.absentDeduction || 0)}</span>
              </div>
              <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
                <span>Late Arrival Penalties:</span>
                <span>-{formatCurrency(selectedSlip.deductions?.latePenalty || 0)}</span>
              </div>
              <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
                <span>Income Tax (Official Slab):</span>
                <span>-{formatCurrency(selectedSlip.taxDeduction || selectedSlip.monthlyTax || 0)}</span>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex justify-between items-center text-sm">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">Net Take-Home Pay:</span>
              <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedSlip.netSalary || 0)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedSlip(null)}>
                Close
              </Button>
              <Button onClick={() => handleDownloadPdf(selectedSlip)}>
                <Download className="h-4 w-4" />
                <span>Download PDF Statement</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
