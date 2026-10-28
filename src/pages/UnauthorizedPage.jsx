import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-6xl font-bold text-indigo-600">403</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">You do not have permission to open this page.</p>
      <Link to="/" className="mt-6 min-h-11 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700">Go to dashboard</Link>
    </div>
  );
}
