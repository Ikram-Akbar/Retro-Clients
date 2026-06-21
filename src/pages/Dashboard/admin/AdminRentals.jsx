import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertOctagon, RefreshCw, AlertCircle, MapPin, Tag } from 'lucide-react';
import { getVehicles, approveVehicle, rejectVehicle } from '../../../services/vehiclesService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';

const AdminRentals = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVehicles({ page, limit: 12, status: statusFilter || undefined });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setVehicles(list);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load vehicle listings.');
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleApprove = async (id) => {
    const confirmed = await confirm({
      title: 'Approve Vehicle Listing',
      message: 'Are you sure you want to approve this vehicle listing? It will become live immediately on the browse board.',
      confirmText: 'Approve listing',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      setProcessingId(id);
      await approveVehicle(id);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: 'active', isAvailable: true } : v))
      );
      toast.success('Vehicle listing approved successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve vehicle.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const confirmed = await confirm({
      title: 'Reject Vehicle Listing',
      message: 'Are you sure you want to reject this vehicle listing? It will be marked as inactive.',
      confirmText: 'Reject listing',
      cancelText: 'Cancel',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      setProcessingId(id);
      await rejectVehicle(id);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: 'inactive', isAvailable: false } : v))
      );
      toast.success('Vehicle listing rejected.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject vehicle.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Vehicle Listings Moderation</h2>
        <p className="text-sm text-slate-500 mt-1">Review, approve, or reject vehicle listings submitted by platform owners.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-semibold">
          {['pending', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 capitalize transition cursor-pointer border-r border-slate-200 last:border-0 ${statusFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-4 py-2 transition cursor-pointer ${statusFilter === '' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            All
          </button>
        </div>
        <button
          onClick={fetchVehicles}
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

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white animate-pulse overflow-hidden">
              <div className="h-44 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <Tag size={24} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No listings found</h3>
          <p className="mt-2 text-xs text-slate-500">No vehicle listings match the selected filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((car) => {
            const image = car.images?.[0]?.url || car.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300';
            const statusBadge = {
              pending: 'bg-amber-50 border-amber-100 text-amber-700',
              active: 'bg-emerald-50 border-emerald-100 text-emerald-700',
              inactive: 'bg-rose-50 border-rose-100 text-rose-700',
            }[car.status] || 'bg-slate-100 border-slate-200 text-slate-600';

            return (
              <div key={car._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="h-44 relative bg-slate-100">
                  <img src={image} alt={car.title || car.model} className="h-full w-full object-cover" />
                  <span className={`absolute top-4 right-4 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadge}`}>
                    {car.status}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">{car.vehicleType}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{car.brand} {car.model}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {car.location} · {car.year}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Price / Day</span>
                      <span className="font-semibold text-slate-900 mt-0.5">৳{car.pricePerDay}</span>
                    </div>
                    {car.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={processingId === car._id}
                          onClick={() => handleApprove(car._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle size={13} />
                          {processingId === car._id ? '...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={processingId === car._id}
                          onClick={() => handleReject(car._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                        >
                          <AlertOctagon size={13} />
                          {processingId === car._id ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {car.status !== 'pending' && (
                      <span className={`text-xs font-semibold capitalize ${car.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                        {car.status === 'active' ? 'Live & Available' : 'Not Approved'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page {meta.page} of {meta.totalPages} · {meta.total} vehicles
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

export default AdminRentals;
