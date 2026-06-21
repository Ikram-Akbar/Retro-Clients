import { useEffect, useState } from 'react';
import { Bell, ShieldAlert, Check, MailOpen } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/notificationsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const UserNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      const list = unwrapPayload(res.data) || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setUpdating(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">Stay updated with rental alerts and account events.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            disabled={updating}
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 px-4 py-2.5 text-xs font-semibold text-violet-700 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <MailOpen size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => {
            const isAlert = n.type === 'alert' || n.type === 'warning';
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`flex gap-4 p-5 transition cursor-pointer ${
                  n.isRead ? 'hover:bg-slate-50/70 opacity-60' : 'bg-slate-50/30 hover:bg-slate-50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  n.isRead
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : isAlert
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {isAlert ? <ShieldAlert size={18} /> : <Check size={18} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    {!n.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          <Bell size={24} className="mx-auto text-slate-300 mb-2" />
          No notifications found.
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
