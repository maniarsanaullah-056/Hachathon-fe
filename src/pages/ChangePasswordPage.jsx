import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader, Card, Button, ErrorBanner } from '../components/ui/Common.jsx';
import { Input } from '../components/ui/Field.jsx';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const { changePassword, user } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully! You may now access the full portal.');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {user?.mustChangePassword ? 'Action Required: Set New Password' : 'Change Your Password'}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {user?.mustChangePassword
            ? 'For security, temporary logins require an immediate password update.'
            : 'Enter your current password and pick a strong new one.'}
        </p>
      </div>

      <Card>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            type="password"
            label="Current / Temp Password *"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            label="New Password (min 8 chars) *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Confirm New Password *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Update Password</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
