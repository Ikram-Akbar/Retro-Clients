import { useEffect, useState } from 'react';
import { Car, CalendarCheck, Star, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import TakaSign from '../../../components/TakaSign';
import { getOwnerOverview } from '../../../services/dashboardService';
import { getBookings, approveBooking, rejectBooking } from '../../../services/bookingsService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';

const OwnerDashboard = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      const res = await getOwnerOverview();
      const data = unwrapPayload(res.data);
      setOverview(data);
    } catch (err) {
      setError('Failed to load fleet overview.');
      console.error('Failed to load owner overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await getBookings({ status: 'pending', limit: 5 });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setPendingBookings(list);
    } catch (err) {
      console.error('Failed to load pending bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchPendingBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id + '-approve');
      await approveBooking(id);
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
      setOverview((prev) => prev ? {
        ...prev,
        pendingBookings: Math.max(0, (prev.pendingBookings || 0) - 1),
        activeBookings: (prev.activeBookings || 0) + 1,
      } : prev);
      toast.success('Booking request approved successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const confirmed = await confirm({
      title: 'Decline Booking Request',
      message: 'Are you sure you want to decline this booking request? This action cannot be undone.',
      confirmText: 'Yes, decline',
      cancelText: 'Keep pending',
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      setProcessingId(id + '-reject');
      await rejectBooking(id);
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
      setOverview((prev) => prev ? {
        ...prev,
        pendingBookings: Math.max(0, (prev.pendingBookings || 0) - 1),
      } : prev);
      toast.success('Booking request declined successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to decline booking.');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = overview
    ? [
      {
        label: 'Total Earnings',
        value: `৳${(overview.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: TakaSign,
        color: 'text-emerald-600 bg-emerald-50',
      },
      {
        label: 'My Listings',
        value: `${overview.totalListings ?? 0} Vehicles`,
        icon: Car,
        color: 'text-violet-600 bg-violet-50',
        sub: `${overview.activeListings ?? 0} active · ${overview.pendingListings ?? 0} pending`,
      },
      {
        label: 'Active Rentals',
        value: `${overview.activeBookings ?? 0} Active`,
        icon: CalendarCheck,
        color: 'text-sky-600 bg-sky-50',
        sub: `${overview.pendingBookings ?? 0} awaiting approval`,
      },
      {
        label: 'Fleet Rating',
        value: overview.averageRating > 0 ? `${overview.averageRating} / 5` : 'No ratings yet',
        icon: Star,
        color: 'text-amber-600 bg-amber-50',
        sub: `${overview.totalReviews ?? 0} reviews`,
      },
    ]
    : [];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading fleet overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fleet Management Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Track vehicle performance, requests, and total revenue metrics.</p>
        </div>
        <button
          onClick={() => { fetchOverview(); fetchPendingBookings(); }}
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
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              </div>
              {stat.sub && (
                <p className="text-[11px] text-slate-400 mt-1">{stat.sub}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking summary strip */}
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending', value: overview.pendingBookings ?? 0, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Active', value: overview.activeBookings ?? 0, icon: CalendarCheck, color: 'text-sky-600 bg-sky-50 border-sky-100' },
            { label: 'Completed', value: overview.completedBookings ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border p-4 flex items-center gap-4 ${color}`}>
              <div className={`rounded-xl p-2.5 bg-white/60`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs font-semibold opacity-80">{label} Bookings</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Booking Requests */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Booking Requests</h3>

          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-4 border-b border-slate-100">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-200 rounded w-40" />
                    <div className="h-3 bg-slate-200 rounded w-32" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                    <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending booking requests right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingBookings.map((req) => {
                const vehicle = req.vehicleId || {};
                const renter = req.renterId || {};
                const isApproving = processingId === req._id + '-approve';
                const isRejecting = processingId === req._id + '-reject';

                return (
                  <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                    <div>
                      <div className="text-xs text-violet-600 font-bold tracking-wider uppercase">
                        #{req._id?.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {renter.name || 'Unknown Renter'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Requesting: <span className="text-slate-800 font-medium">{vehicle.brand} {vehicle.model || vehicle.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                        {' · '}{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-base font-bold text-slate-900">৳{req.totalAmount?.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!!processingId}
                          onClick={() => handleApprove(req._id)}
                          className="rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isApproving ? <span className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" /> : null}
                          {isApproving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={!!processingId}
                          onClick={() => handleReject(req._id)}
                          className="rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isRejecting ? <span className="h-3 w-3 rounded-full border border-slate-500 border-t-transparent animate-spin" /> : null}
                          {isRejecting ? 'Declining...' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Listing Tips</h3>
            <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed mt-4">
              <li>High resolution photos increase booking rates by 40%.</li>
              <li>Keep your calendar updated to avoid booking conflicts.</li>
              <li>Respond to requests within 2 hours to maintain high placement.</li>
              <li>Complete bookings promptly to earn verified reviews.</li>
            </ul>
          </div>
          <div className="mt-6 space-y-2">
            <a
              href="/dashboard/owner/add-listing"
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 shadow-xs"
            >
              Add New Listing
            </a>
            <a
              href="/dashboard/owner/booking-requests"
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              View All Requests
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
