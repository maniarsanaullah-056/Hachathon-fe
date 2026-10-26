import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600 disabled:opacity-50 shadow-xs shadow-indigo-600/20',
  secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-xs shadow-red-600/20',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shadow-xs shadow-emerald-600/20',
};

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all disabled:cursor-not-allowed active:scale-[0.98] ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ title, description, actions, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div>
            {title && <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

const BADGE_TONES = {
  green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
  red: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-800',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800',
  orange: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-800',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 ring-indigo-200 dark:ring-indigo-800',
  teal: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 ring-teal-200 dark:ring-teal-800',
  purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 ring-purple-200 dark:ring-purple-800',
  blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-800',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_TONES[tone] || BADGE_TONES.slate} ${className}`}>
      {children}
    </span>
  );
}

export const statusTone = (status) => {
  switch (status) {
    case 'present':
    case 'active':
    case 'approved':
    case 'finalized':
      return 'green';
    case 'late':
      return 'amber';
    case 'half_day':
      return 'orange';
    case 'absent':
    case 'terminated':
    case 'rejected':
      return 'red';
    case 'on_leave':
      return 'blue';
    case 'missing_checkout':
      return 'purple';
    case 'pending':
    case 'draft':
      return 'indigo';
    default:
      return 'slate';
  }
};

export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-indigo-600 dark:text-indigo-400 ${s}`} />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30 animate-pulse mb-4">
        H
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
      <span className="mt-3 text-xs font-medium text-slate-500">Loading HCM Lite...</span>
    </div>
  );
}

export function EmptyState({ title, message, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <p className="text-base font-semibold text-slate-900 dark:text-white">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs sm:text-sm text-red-800 dark:text-red-300 shadow-xs">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline hover:text-red-900">
          Retry
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, description, actions, backTo }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {backTo && (
          <Link to={backTo} className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function StatCard({ title, value, change, hint, icon: Icon, tone = 'indigo' }) {
  const toneClasses = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60',
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.indigo}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</span>
        {change && (
          <span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
            {change}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
