import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-indigo-600">403</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">You do not have permission to open this page.</p>
      <Link to="/" className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Go to dashboard</Link>
    </div>
  );
}
