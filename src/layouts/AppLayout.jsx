import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Clock, Calendar, FileText, User, Users, 
  CalendarDays, CheckSquare, CalendarCheck, DollarSign, Building2, 
  UserCheck, CalendarOff, Settings, Shield, Megaphone, Menu, 
  Moon, Sun, Search, LogOut, KeyRound, Sparkles, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { NAV_ITEMS, ROLE_LABELS } from '../utils/roles.js';
import { Badge } from '../components/ui/Common.jsx';
import NotificationsPopover from '../components/NotificationsPopover.jsx';
import AiAssistantDrawer from '../components/AiAssistantDrawer.jsx';
import CommandPalette from '../components/CommandPalette.jsx';

const ICONS = {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  User,
  Users,
  CalendarDays,
  CheckSquare,
  CalendarCheck,
  DollarSign,
  Building2,
  UserCheck,
  CalendarOff,
  Settings,
  Shield,
  Megaphone,
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 font-bold text-white shadow-md shadow-indigo-500/20">
              H
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">HCM Lite</span>
              <span className="block text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Enterprise</span>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Quick Command Trigger */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2 text-xs text-slate-400 hover:border-indigo-400 transition"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search menu...</span>
            </span>
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || LayoutDashboard;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User info in sidebar */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/80 font-bold text-xs text-indigo-700 dark:text-indigo-400">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-400">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {ROLE_LABELS[user?.role] || ''} Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 text-xs font-bold text-white shadow-xs">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold leading-tight text-slate-900 dark:text-white">{user?.name}</span>
                  <span className="block text-[10px] text-slate-400">{user?.email}</span>
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div
                    role="menu"
                    className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                        {ROLE_LABELS[user?.role]}
                      </span>
                    </div>

                    <Link
                      role="menuitem"
                      to="/change-password"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      <span>Change password</span>
                    </Link>

                    <button
                      role="menuitem"
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant Drawer */}
      <AiAssistantDrawer />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
