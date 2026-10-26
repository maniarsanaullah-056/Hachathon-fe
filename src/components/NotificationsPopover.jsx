import { useEffect, useState } from 'react';
import { 
  Bell, Check, ChevronDown, Clock, Info, AlertTriangle, AlertCircle, 
  CheckCircle2, XCircle, ArrowRight, ExternalLink 
} from 'lucide-react';
import { commsApi } from '../services/hcmServices.js';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await commsApi.getNotifications();
      if (res) {
        setNotifications(res.notifications || res.items || []);
        setUnreadCount(res.unreadCount ?? (res.notifications || []).filter(n => !n.isRead).length);
      }
    } catch {
      // quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await commsApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await commsApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) loadNotifications();
        }}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loading && notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                    <Bell className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">You have no new notifications.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    className={`flex items-start gap-3 p-3.5 transition text-left cursor-pointer ${
                      n.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'leave_approved' || n.type === 'correction_approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : n.type === 'leave_rejected' || n.type === 'correction_rejected' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Info className="h-4 w-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
                        {n.title || n.message}
                      </p>
                      {n.title && n.message && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(n.createdAt || new Date())}</p>
                    </div>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
