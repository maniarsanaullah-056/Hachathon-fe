import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Common.jsx';
import { Input, Select, Textarea } from './ui/Field.jsx';
import { employeesApi } from '../services/peopleService.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage, getFieldErrors, toInputDate } from '../utils/format.js';

const EMPTY = { fullName: '', email: '', employeeCode: '', department: '', designation: '', joiningDate: '', basicSalary: '', phone: '', gender: '', address: '' };

// employee diya ho to edit mode, warna create mode
export default function EmployeeFormModal({ open, onClose, employee, departments, designations, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(employee);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      employee
        ? {
            fullName: employee.fullName,
            email: employee.email,
            employeeCode: employee.employeeCode,
            department: employee.department?._id || employee.department || '',
            designation: employee.designation?._id || employee.designation || '',
            joiningDate: toInputDate(employee.joiningDate),
            basicSalary: employee.basicSalary ?? '',
            phone: employee.phone || '',
            gender: employee.gender || '',
            address: employee.address || '',
          }
        : EMPTY
    );
  }, [open, employee, reset]);

  const onSubmit = async (v) => {
    const payload = {
      fullName: v.fullName.trim(),
      email: v.email.trim(),
      department: v.department,
      designation: v.designation,
      joiningDate: v.joiningDate,
      basicSalary: Number(v.basicSalary),
      phone: v.phone.trim(),
      gender: v.gender,
      address: v.address.trim(),
    };
    if (v.employeeCode.trim()) payload.employeeCode = v.employeeCode.trim();

    try {
      const res = isEdit ? await employeesApi.update(employee._id, payload) : await employeesApi.create(payload);
      toast.success(isEdit ? 'Employee updated' : 'Employee created');
      onSaved(res);
    } catch (err) {
      Object.entries(getFieldErrors(err)).forEach(([field, message]) => setError(field, { message }));
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit employee' : 'Register employee'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="employee-form" loading={isSubmitting}>{isEdit ? 'Save changes' : 'Create employee'}</Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input label="Full name" required error={errors.fullName?.message} {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
        <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
        <Input label="Employee code" hint={isEdit ? undefined : 'Leave empty to auto-generate (EMP-0001)'} error={errors.employeeCode?.message} {...register('employeeCode', { pattern: { value: /^[A-Za-z0-9_-]{2,20}$/, message: '2-20 letters, numbers, - or _' } })} />
        <Input label="Joining date" type="date" required error={errors.joiningDate?.message} {...register('joiningDate', { required: 'Joining date is required' })} />
        <Select label="Department" required error={errors.department?.message} {...register('department', { required: 'Select a department' })}>
          <option value="">Select department</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </Select>
        <Select label="Designation" required error={errors.designation?.message} {...register('designation', { required: 'Select a designation' })}>
          <option value="">Select designation</option>
          {designations.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}
        </Select>
        <Input label="Basic salary (PKR / month)" type="number" step="any" required error={errors.basicSalary?.message} {...register('basicSalary', { required: 'Basic salary is required', validate: (val) => Number(val) > 0 || 'Salary must be greater than 0' })} />
        <Input label="Phone" error={errors.phone?.message} {...register('phone', { pattern: { value: /^[0-9+\-\s()]{7,20}$/, message: 'Invalid phone number' } })} />
        <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
        <div className="sm:col-span-2">
          <Textarea label="Address" error={errors.address?.message} {...register('address', { maxLength: { value: 300, message: 'Max 300 characters' } })} />
        </div>
        {!isEdit && <p className="text-xs text-slate-500 sm:col-span-2">A login is created together with the employee. A secure temporary password is shown once after saving.</p>}
      </form>
    </Modal>
  );
}
