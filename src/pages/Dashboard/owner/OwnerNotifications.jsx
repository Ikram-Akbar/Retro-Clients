import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/notificationsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const typeConfig = {
  info: { icon: Info, iconColor: 'bg-sky-50 text-sky-600' },
  success: { icon: CheckCircle2, iconColor: 'bg-emerald-50 text-emerald-600' },
  warning: { icon: AlertTriangle, iconColor: 'bg-amber-50 text-amber-600' },
  error: { icon: XCircle, iconColor: 'bg-rose-50 text-rose-600' },
};

const OwnerNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotifications({ page, limit: 15 });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setNotifications(list);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load notifications.');
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      setMarkingId(id);
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">Track fleet-related transaction and approval updates.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-100 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition cursor-pointer disabled:opacity-50"
          >
            <CheckCheck size={14} />
            {markingAll ? 'Marking...' : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden max-w-4xl">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-5 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-32" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-4xl">
          <Bell size={24} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No notifications yet</h3>
          <p className="mt-2 text-xs text-slate-500">Booking approvals, payments, and updates will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden max-w-4xl">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n._id}
                className={`flex gap-4 p-5 transition ${n.isRead ? 'hover:bg-slate-50' : 'bg-violet-50/30 hover:bg-violet-50/50'}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    disabled={markingId === n._id}
                    className="shrink-0 self-start rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                  >
                    {markingId === n._id ? '...' : 'Mark read'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between max-w-4xl">
          <span className="text-xs text-slate-400">
            Page {meta.page} of {meta.totalPages} · {meta.total} notifications
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerNotifications;
