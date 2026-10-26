import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button, ErrorBanner } from '../components/ui/Common.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Sparkles, Building2, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SetupPage() {
  const { setupCompany } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) {
      setError('Please provide your organization name.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await setupCompany({
        companyName,
        adminName,
        adminEmail,
        adminPassword,
      });
      toast.success('Organization initialized! Welcome to HCM Lite.');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl">
        {/* Wizard Stepper Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold">
              H
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Organization First-Run Setup</h2>
              <p className="text-xs text-slate-400">Step {step} of 2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-8 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <span className={`h-2.5 w-8 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        <ErrorBanner message={error} />

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="text-left mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Company Particulars
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Name your enterprise workspace to get started.
              </p>
            </div>

            <Input
              label="Company / Enterprise Name *"
              placeholder="e.g. Saylani Tech Foundation"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <div className="flex justify-end pt-4">
              <Button type="submit">
                <span>Continue to Admin Setup</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Primary Administrator Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create the master root administrator credentials.
              </p>
            </div>

            <Input
              label="Full Name *"
              placeholder="System Administrator"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Admin Email *"
              placeholder="admin@saylani.org"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="password"
                label="Admin Password *"
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Confirm Password *"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" loading={loading} className="bg-gradient-to-r from-indigo-600 to-teal-500">
                <CheckCircle2 className="h-4 w-4" />
                <span>Initialize Workspace</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
