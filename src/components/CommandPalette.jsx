import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, LayoutDashboard, Users, Calendar, Clock, DollarSign, Settings, FileText, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/roles.js';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const role = user?.role;

  const allActions = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE] },
    { label: 'My Profile', icon: Users, to: '/my-profile', roles: [ROLES.EMPLOYEE] },
    { label: 'Attendance Check-in & Calendar', icon: Clock, to: '/attendance', roles: [ROLES.EMPLOYEE] },
    { label: 'Daily Attendance Board', icon: Clock, to: '/attendance/board', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Attendance Corrections Inbox', icon: Clock, to: '/corrections', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Apply Leave / Balances', icon: Calendar, to: '/leaves', roles: [ROLES.EMPLOYEE] },
    { label: 'Leave Approvals Inbox', icon: Calendar, to: '/leaves/approvals', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Employees Directory', icon: Users, to: '/employees', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Payroll & Payslips', icon: DollarSign, to: '/payroll', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'My Payslips', icon: DollarSign, to: '/payslips', roles: [ROLES.EMPLOYEE] },
    { label: 'Departments & Designations', icon: Settings, to: '/organization', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Leave Quotas & Holidays', icon: Calendar, to: '/leave-settings', roles: [ROLES.ADMIN] },
    { label: 'Company Settings & Geolocation', icon: Settings, to: '/company', roles: [ROLES.ADMIN] },
    { label: 'HR Account Management', icon: Users, to: '/users', roles: [ROLES.ADMIN] },
    { label: 'Audit Log Trail', icon: Shield, to: '/audit', roles: [ROLES.ADMIN] },
    { label: 'Announcements Center', icon: Bell, to: '/announcements', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE] },
    { label: 'Change Password', icon: Settings, to: '/change-password', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE] },
  ];

  const filtered = allActions.filter(
    (a) => a.roles.includes(role) && a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (to) => {
    navigate(to);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a screen or command..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No matching commands</p>
          ) : (
            filtered.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(action.to)}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
