import { forwardRef } from 'react';

const INPUT =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-500';

function Wrapper({ label, htmlFor, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, required, id, className = '', ...props }, ref) {
  const fieldId = id || props.name;
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={`${INPUT} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
        {...props}
      />
    </Wrapper>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, required, id, children, className = '', ...props }, ref) {
  const fieldId = id || props.name;
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={`${INPUT} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, required, id, className = '', ...props }, ref) {
  const fieldId = id || props.name;
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={3}
        aria-invalid={Boolean(error)}
        className={`${INPUT} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
        {...props}
      />
    </Wrapper>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, hint, id, ...props }, ref) {
  const fieldId = id || props.name;
  return (
    <div className="flex items-start gap-2">
      <input ref={ref} id={fieldId} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" {...props} />
      <label htmlFor={fieldId} className="text-sm text-slate-700">
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </label>
    </div>
  );
});
