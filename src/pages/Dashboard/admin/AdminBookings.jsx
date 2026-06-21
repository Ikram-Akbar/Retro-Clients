import { useEffect, useState, useCallback } from 'react';
import { CalendarRange, RefreshCw, AlertCircle } from 'lucide-react';
import { getBookings } from '../../../services/bookingsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const statusConfig = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-violet-50 text-violet-700 border-violet-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  rejected: 'bg-slate-100 text-slate-600 border-slate-200',
};

const AdminBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await getBookings(params);
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setBookings(list);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load bookings.');
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">Audit and verify all active, upcoming, and completed reservation logs.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-semibold">
          {['', 'pending', 'approved', 'completed', 'cancelled', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 capitalize transition cursor-pointer border-r border-slate-200 last:border-0 ${statusFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchBookings}
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Booking ID</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Renter</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-28" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-28" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <CalendarRange size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No bookings found.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const vehicle = b.vehicleId || {};
                  const renter = b.renterId || {};
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 pl-6 font-mono text-xs text-violet-600 font-semibold">
                        #{b._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {vehicle.brand} {vehicle.model || vehicle.name || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{vehicle.vehicleType}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-900">{renter.name || '—'}</div>
                        <div className="text-[11px] text-slate-400">{renter.email || ''}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                        <div className="text-[11px] text-slate-400">{b.totalDays} day{b.totalDays !== 1 ? 's' : ''}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        ${b.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${statusConfig[b.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} · {meta.total} bookings
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
    </div>
  );
};

export default AdminBookings;
