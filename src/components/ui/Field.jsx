export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        {...props} // <-- Yeh sabse zaroori hai! Yeh react-hook-form ke onChange aur ref ko input se connect karta hai
        className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
      />
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
export function Select({
  label,
  error,
  helperText,
  children,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white transition focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-850 disabled:text-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-850 disabled:text-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : ""
        } ${className}`}
        rows={3}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function Checkbox({
  label,
  error,
  helperText,
  className = "",
  ...props
}) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5 ${className}`}
        {...props}
      />
      <div>
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        )}
      </div>
    </div>
  );
}
