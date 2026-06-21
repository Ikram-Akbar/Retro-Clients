import { useEffect, useState } from 'react';
import { CalendarRange, Heart, Bell, Clock3, ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';
import TakaSign from '../../../components/TakaSign';
import { getRenterOverview } from '../../../services/dashboardService';
import { getWishlist } from '../../../services/wishlistService';
import { getNotifications } from '../../../services/notificationsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
    wishlistItems: 0,
    notificationsCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, wishlistRes, notificationsRes] = await Promise.all([
        getRenterOverview(),
        getWishlist(),
        getNotifications(),
      ]);

      const overviewData = unwrapPayload(overviewRes.data) || {};
      const wishlistData = unwrapPayload(wishlistRes.data) || [];
      const notificationsData = unwrapPayload(notificationsRes.data) || [];

      setStats({
        totalBookings: overviewData.totalBookings || 0,
        pendingBookings: overviewData.pendingBookings || 0,
        approvedBookings: overviewData.approvedBookings || 0,
        completedBookings: overviewData.completedBookings || 0,
        cancelledBookings: overviewData.cancelledBookings || 0,
        totalSpent: overviewData.totalSpent || 0,
        wishlistItems: wishlistData.length,
        notificationsCount: notificationsData.filter(n => !n.isRead).length,
      });

      setRecentBookings(overviewData.recentBookings || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to retrieve renter overview metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statItems = [
    {
      label: 'Total Spent',
      value: `৳${(stats.totalSpent ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Bookings',
      value: `${stats.totalBookings} Booking${stats.totalBookings !== 1 ? 's' : ''}`,
      icon: ClipboardList,
      color: 'text-violet-600 bg-violet-50',
      sub: `${stats.pendingBookings} pending · ${stats.approvedBookings} approved`,
    },
    {
      label: 'Completed Rentals',
      value: `${stats.completedBookings} Completed`,
      icon: Clock3,
      color: 'text-sky-600 bg-sky-50',
      sub: `${stats.cancelledBookings} cancelled`,
    },
    {
      label: 'Wishlist & Alerts',
      value: `${stats.wishlistItems} Saved`,
      icon: Heart,
      color: 'text-rose-600 bg-rose-50',
      sub: `${stats.notificationsCount} unread notification${stats.notificationsCount !== 1 ? 's' : ''}`,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Fetching overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
          <p className="text-sm text-slate-500 mt-1">Here is what is happening with your rentals today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                <span className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              </div>
              {stat.sub && (
                <p className="text-[11px] text-slate-400 mt-1">{stat.sub}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Bookings</h3>
          {recentBookings.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-slate-100">
                {recentBookings.map((booking) => {
                  const statusColors = {
                    pending: 'bg-amber-50 text-amber-700 border border-amber-100',
                    approved: 'bg-violet-50 text-violet-700 border border-violet-100',
                    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                    cancelled: 'bg-rose-50 text-rose-700 border border-rose-100',
                    rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
                  };
                  return (
                    <li key={booking._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {booking.vehicleId?.brand} {booking.vehicleId?.model || booking.vehicleId?.title || booking.vehicleId?.name || 'Booking Request'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()} · ৳{booking.totalAmount}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusColors[booking.status] || 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent booking requests found.
            </div>
          )}
        </div>

        {/* Support Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need assistance?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our 24/7 support team is here to help you with active bookings, vehicle pickups, or account issues.
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/about"
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 shadow-xs"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
