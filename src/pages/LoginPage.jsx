import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Button, ErrorBanner } from '../components/ui/Common.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      const data = await login(email, password);
      if (data.mustChangePassword) navigate('/change-password', { replace: true });
      else navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to HCM Lite">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <ErrorBanner message={serverError} />
        <Input label="Email" type="email" autoComplete="username" required error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
        <Input label="Password" type="password" autoComplete="current-password" required error={errors.password?.message} {...register('password', { required: 'Password is required' })} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
      </form>
    </AuthLayout>
  );
}
