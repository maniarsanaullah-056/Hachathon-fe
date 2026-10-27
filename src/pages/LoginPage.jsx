import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button, ErrorBanner } from '../components/ui/Common.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user?.name || 'User'}!`);
      if (data.mustChangePassword) {
        window.location.href = '/change-password';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('AdminPassword123');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Brand Side Panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 lg:p-12 text-white lg:w-1/2">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 font-extrabold text-white text-lg shadow-lg">
              H
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">HCM Lite</span>
              <span className="block text-[10px] font-semibold text-teal-300 uppercase tracking-widest">
                Saylani Hackathon Edition
              </span>
            </div>
          </div>

          <div className="mt-16 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-md mb-4 text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Workforce Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Human Capital Management, engineered for speed and clarity.
            </h1>
            <p className="mt-4 text-sm text-indigo-200 leading-relaxed">
              Real-time attendance geofencing, automated monthly payroll proration, smart AI leave interpretations and multi-role governance.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs text-indigo-200">
          <div>
            <span className="font-semibold text-white">Smart Geofence</span>
            <p className="text-[11px] text-indigo-300 mt-0.5">Camera verification & radius lock</p>
          </div>
          <div>
            <span className="font-semibold text-white">Automated Payroll</span>
            <p className="text-[11px] text-indigo-300 mt-0.5">Tax calculations & PDF payslips</p>
          </div>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In to Portal</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Enter your credentials to access your organization dashboard.
            </p>
          </div>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Work Email Address *"
              placeholder="e.g. admin@saylani.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password *"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full py-2.5">
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Fill Demo Helpers for Judges */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Judges Quick-Fill Credentials:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@saylani.org')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:border-indigo-400"
              >
                Admin (admin@saylani.org)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
