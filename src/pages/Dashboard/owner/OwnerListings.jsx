import { useEffect, useState, useCallback } from 'react';
import { Edit, Trash2, Plus, RefreshCw, AlertCircle, MapPin, Car } from 'lucide-react';
import { getVehicles, deleteVehicle } from '../../../services/vehiclesService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useAuth from '../../../hooks/useAuth';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';

const statusConfig = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  inactive: 'bg-rose-50 text-rose-700 border-rose-100',
};

const OwnerListings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVehicles({ page, limit: 12 });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setListings(list);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load your listings.');
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: 'Remove Listing',
      message: `Are you sure you want to remove "${name}" from your listings? This action cannot be undone.`,
      confirmText: 'Delete listing',
      cancelText: 'Keep listing',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteVehicle(id);
      setListings((prev) => prev.filter((v) => v._id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
      toast.success('Listing removed successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete vehicle.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Vehicle Listings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and edit your registered vehicles available for rent.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchListings}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <a
            href="/dashboard/owner/add-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer"
          >
            <Plus size={16} />
            Create Listing
          </a>
        </div>
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
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <Car size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-slate-800">No listings yet</h3>
          <p className="mt-2 text-xs text-slate-500 mb-6">Start earning by adding your first vehicle to the platform.</p>
          <a
            href="/dashboard/owner/add-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
          >
            <Plus size={16} />
            Add Your First Vehicle
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((car) => {
            const image =
              car.images?.[0]?.url ||
              car.images?.[0] ||
              'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300';
            const statusClass = statusConfig[car.status] || 'bg-slate-100 text-slate-600 border-slate-200';
            const isDeleting = deletingId === car._id;

            return (
              <div key={car._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs group">
                <div className="h-44 relative bg-slate-100">
                  <img
                    src={image}
                    alt={car.model || car.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-300"
                  />
                  <span className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold border capitalize ${statusClass}`}>
                    {car.status}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">{car.vehicleType}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {car.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Price Daily</span>
                      <span className="font-semibold text-slate-800 mt-0.5">৳{car.pricePerDay}/day</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Reviews</span>
                      <span className="font-semibold text-slate-800 mt-0.5">
                        {car.reviewCount ?? 0} review{car.reviewCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                    <a
                      href={`/dashboard/owner/add-listing?edit=${car._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Edit size={12} />
                      Edit
                    </a>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(car._id, `${car.brand} ${car.model}`)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-transparent p-2 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <span className="h-3.5 w-3.5 rounded-full border border-rose-400 border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
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
            Page {meta.page} of {meta.totalPages} · {meta.total} listings
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

export default OwnerListings;
