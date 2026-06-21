import { useEffect, useState } from 'react';
import { Users, CarFront, CalendarRange, TrendingUp, AlertCircle } from 'lucide-react';
import { getDashboardOverview } from '../../../services/dashboardService';
import { unwrapPayload } from '../../../api/tokenUtils';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalVehicles: 0,
    pendingVehicleApprovals: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await getDashboardOverview();
        const data = unwrapPayload(res.data);
        setOverview(data || {});
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
        setError('Failed to load platform metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const stats = [
    {
      label: 'Total Platform Users',
      value: loading ? '—' : overview.totalUsers?.toLocaleString() ?? '0',
      icon: Users,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Total Vehicles',
      value: loading ? '—' : overview.totalVehicles?.toLocaleString() ?? '0',
      icon: CarFront,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Global Bookings',
      value: loading ? '—' : overview.totalBookings?.toLocaleString() ?? '0',
      icon: CalendarRange,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Revenue',
      value: loading ? '—' : `৳${(overview.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Control Center</h2>
        <p className="text-sm text-slate-500 mt-1">Review active system metrics and administrative event alerts.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Key Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Highlights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Pending vehicle approvals waiting for review
                </span>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                {overview.pendingVehicleApprovals ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span className="text-xs font-semibold text-slate-700">Total registered fleet owners</span>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 rounded-full px-2.5 py-0.5">
                {overview.totalOwners ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold text-slate-700">Total registered renters on platform</span>
              </div>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-0.5">
                {(overview.totalUsers ?? 0) - (overview.totalOwners ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Administration Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Moderator Utilities</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Access database consoles, verify user identity documents, audit transactions, and view overall system health metrics.
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <a href="/dashboard/admin/users" className="flex items-center justify-center rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer">
              Manage Users
            </a>
            <a href="/dashboard/admin/rentals" className="flex items-center justify-center rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer">
              View Rental Queue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
