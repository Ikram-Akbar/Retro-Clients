import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, User, RefreshCw, AlertCircle, CalendarRange } from 'lucide-react';
import { getBookings, approveBooking, rejectBooking, completeBooking } from '../../../services/bookingsService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';

const statusConfig = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  completed: 'bg-violet-50 text-violet-700 border-violet-100',
};

const OwnerBookingRequests = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
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
      setError('Failed to load booking requests.');
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id + '-approve');
      await approveBooking(id);
      // Remove from list if filtering by pending, otherwise update status
      if (statusFilter === 'pending') {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'approved' } : b));
      }
      toast.success('Booking approved successfully.');
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
      if (statusFilter === 'pending') {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'rejected' } : b));
      }
      toast.success('Booking request declined.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to decline booking.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (id) => {
    const confirmed = await confirm({
      title: 'Complete Rental',
      message: 'Are you sure you want to mark this rental booking as completed? This confirms the vehicle has been returned.',
      confirmText: 'Yes, complete rental',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      setProcessingId(id + '-complete');
      await completeBooking(id);
      if (statusFilter === 'approved') {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'completed' } : b));
      }
      toast.success('Rental marked as completed.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Booking Requests</h2>
        <p className="text-sm text-slate-500 mt-1">Accept or decline pending customer reservations for your vehicles.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-semibold">
          {['pending', 'approved', 'rejected', 'completed', 'cancelled', ''].map((s) => (
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
                <th className="p-4 pl-6">Renter</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Payout</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                    <td className="p-4 pr-6"><div className="h-7 bg-slate-200 rounded-lg w-28 ml-auto" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <CalendarRange size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No {statusFilter || ''} bookings found.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((req) => {
                  const vehicle = req.vehicleId || {};
                  const renter = req.renterId || {};
                  const isApproving = processingId === req._id + '-approve';
                  const isRejecting = processingId === req._id + '-reject';

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{renter.name || '—'}</div>
                            <div className="text-[10px] text-slate-400">{renter.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 text-xs">{vehicle.brand} {vehicle.model || vehicle.name || '—'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{vehicle.vehicleType}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                        <div className="text-[11px] text-slate-400">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ৳{req.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${statusConfig[req.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={!!processingId}
                              onClick={() => handleApprove(req._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                            >
                              {isApproving
                                ? <span className="h-3 w-3 rounded-full border border-emerald-600 border-t-transparent animate-spin" />
                                : <CheckCircle size={12} />}
                              {isApproving ? '...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              disabled={!!processingId}
                              onClick={() => handleReject(req._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                            >
                              {isRejecting
                                ? <span className="h-3 w-3 rounded-full border border-rose-500 border-t-transparent animate-spin" />
                                : <XCircle size={12} />}
                              {isRejecting ? '...' : 'Decline'}
                            </button>
                          </div>
                        ) : req.status === 'approved' && new Date() >= new Date(req.endDate) ? (
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              disabled={!!processingId}
                              onClick={() => handleComplete(req._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition cursor-pointer disabled:opacity-50"
                            >
                              {processingId === req._id + '-complete'
                                ? <span className="h-3 w-3 rounded-full border border-violet-600 border-t-transparent animate-spin" />
                                : <CheckCircle size={12} />}
                              {processingId === req._id + '-complete' ? '...' : 'Complete Rental'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold capitalize">{req.status}</span>
                        )}
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
              Page {meta.page} of {meta.totalPages} · {meta.total} requests
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

export default OwnerBookingRequests;
