import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Button, ErrorBanner } from '../components/ui/Common.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/format.js';

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export default function SetupPage() {
  const { setupCompany } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (v) => {
    setServerError('');
    try {
      await setupCompany({
        companyName: v.companyName,
        adminName: v.adminName,
        adminEmail: v.adminEmail,
        adminPassword: v.adminPassword,
        setupKey: v.setupKey || undefined,
      });
      toast.success('Company created. Welcome to HCM Lite!');
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Set up your company" subtitle="First-time setup: create your company and the Admin account" wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <ErrorBanner message={serverError} />
        <Input label="Company name" required error={errors.companyName?.message} {...register('companyName', { required: 'Company name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Admin name" required error={errors.adminName?.message} {...register('adminName', { required: 'Admin name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
          <Input label="Admin email" type="email" required autoComplete="username" error={errors.adminEmail?.message} {...register('adminEmail', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Password" type="password" required autoComplete="new-password" hint="8+ chars with upper, lower and a number" error={errors.adminPassword?.message} {...register('adminPassword', { required: 'Password is required', pattern: { value: PASSWORD_RE, message: 'Needs 8+ chars, upper, lower and a number' } })} />
          <Input label="Confirm password" type="password" required autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword', { required: 'Confirm your password', validate: (val) => val === watch('adminPassword') || 'Passwords do not match' })} />
        </div>
        <Input label="Setup key (optional)" type="password" hint="Only needed if the server has SETUP_KEY configured" {...register('setupKey')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Create company & Admin</Button>
      </form>
    </AuthLayout>
  );
}
