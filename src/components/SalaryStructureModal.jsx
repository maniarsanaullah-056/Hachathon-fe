import { useEffect, useState } from 'react';
import { DollarSign, Save, RefreshCw, Calculator } from 'lucide-react';
import { Button } from './ui/Common.jsx';
import Modal from './ui/Modal.jsx';
import { Input } from './ui/Field.jsx';
import { formatCurrency } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import api, { unwrap } from '../services/api.js';

export default function SalaryStructureModal({ open, onClose, employee, onSaved }) {
  const toast = useToast();
  const [basicSalary, setBasicSalary] = useState('');
  const [hraAllowance, setHraAllowance] = useState('');
  const [medicalAllowance, setMedicalAllowance] = useState('');
  const [otherAllowance, setOtherAllowance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      const basic = employee.basicSalary || employee.salaryStructure?.basicSalary || 0;
      setBasicSalary(basic || '');
      setHraAllowance(employee.salaryStructure?.hraAllowance ?? Math.round(basic * 0.4));
      setMedicalAllowance(employee.salaryStructure?.medicalAllowance ?? Math.round(basic * 0.1));
      setOtherAllowance(employee.salaryStructure?.otherAllowance ?? 0);
    }
  }, [employee]);

  // Live Auto Compute Formula (Basic * 1.5 = Gross, where HRA=40%, Medical=10%)
  const handleBasicChange = (val) => {
    setBasicSalary(val);
    const num = Number(val) || 0;
    setHraAllowance(Math.round(num * 0.4));
    setMedicalAllowance(Math.round(num * 0.1));
  };

  const basicNum = Number(basicSalary) || 0;
  const hraNum = Number(hraAllowance) || 0;
  const medNum = Number(medicalAllowance) || 0;
  const otherNum = Number(otherAllowance) || 0;
  const liveGross = basicNum + hraNum + medNum + otherNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!basicNum || basicNum <= 0) {
      toast.error('Basic salary must be greater than zero');
      return;
    }
    setSaving(true);
    try {
      // Contract: PUT /api/employees/:id/salary-structure
      await unwrap(
        api.put(`/employees/${employee._id}/salary-structure`, {
          basicSalary: basicNum,
          hraAllowance: hraNum,
          medicalAllowance: medNum,
          otherAllowance: otherNum,
        })
      );
      toast.success('Salary structure updated successfully');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update salary structure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Salary Structure: ${employee?.fullName || 'Employee'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          type="number"
          label="Basic Salary (PKR) *"
          value={basicSalary}
          onChange={(e) => handleBasicChange(e.target.value)}
          placeholder="e.g. 100000"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="House Rent Allowance (HRA 40%)"
            value={hraAllowance}
            onChange={(e) => setHraAllowance(e.target.value)}
          />
          <Input
            type="number"
            label="Medical Allowance (10%)"
            value={medicalAllowance}
            onChange={(e) => setMedicalAllowance(e.target.value)}
          />
        </div>

        <Input
          type="number"
          label="Other / Special Allowances"
          value={otherAllowance}
          onChange={(e) => setOtherAllowance(e.target.value)}
        />

        {/* Live Computed Gross Preview */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Calculator className="h-4 w-4" /> Live Computed Gross:
            </span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(liveGross)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Multiplier: 1.5x Basic preview ({basicNum} basic + {hraNum + medNum + otherNum} allowances)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Structure
          </Button>
        </div>
      </form>
    </Modal>
  );
}
