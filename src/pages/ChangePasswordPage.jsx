import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Button, ErrorBanner } from '../components/ui/Common.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/format.js';

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export default function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const forced = user?.mustChangePassword;

  const onSubmit = async (v) => {
    setServerError('');
    try {
      await changePassword(v.currentPassword, v.newPassword);
      toast.success('Password changed successfully');
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Change password"
      subtitle={forced ? 'You are using a temporary password. Please set a new one to continue.' : 'Choose a strong new password'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <ErrorBanner message={serverError} />
        <Input label="Current password" type="password" autoComplete="current-password" required error={errors.currentPassword?.message} {...register('currentPassword', { required: 'Current password is required' })} />
        <Input label="New password" type="password" autoComplete="new-password" required hint="8+ chars with upper, lower and a number" error={errors.newPassword?.message} {...register('newPassword', { required: 'New password is required', pattern: { value: PASSWORD_RE, message: 'Needs 8+ chars, upper, lower and a number' } })} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword', { required: 'Confirm your new password', validate: (val) => val === watch('newPassword') || 'Passwords do not match' })} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Update password</Button>
        <div className="text-center text-sm">
          {forced ? (
            <button type="button" onClick={logout} className="text-slate-500 hover:underline">Log out instead</button>
          ) : (
            <Link to="/" className="text-indigo-600 hover:underline">Back to dashboard</Link>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
