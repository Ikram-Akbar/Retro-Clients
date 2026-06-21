import { useEffect, useState, useCallback } from 'react';
import { Star, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { getOwnerReviews } from '../../../services/reviewsService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useAuth from '../../../hooks/useAuth';

const OwnerReviews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState(null);
  const [avgRating, setAvgRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getOwnerReviews(user._id, { page, limit: 10, sortBy, sortOrder: 'desc' });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setReviews(list);
      if (res.data?.meta) setMeta(res.data.meta);

      // Calculate average rating on current page
      if (list.length > 0) {
        const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
        setAvgRating(Number(avg.toFixed(1)));
      }
    } catch (err) {
      setError('Failed to load reviews.');
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Client Reviews</h2>
        <p className="text-sm text-slate-500 mt-1">Rating details left by your vehicle renters.</p>
      </div>

      {/* Summary bar */}
      {!loading && reviews.length > 0 && (
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
            <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
            <span className="text-sm text-slate-500">/ 5</span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Reviews</span>
            <div className="text-base font-bold text-slate-900">{meta.total}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer font-semibold"
        >
          <option value="createdAt">Newest First</option>
          <option value="rating">Highest Rating</option>
        </select>
        <button
          onClick={fetchReviews}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
        {!loading && (
          <span className="text-xs text-slate-400">{meta.total} total reviews</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-3 bg-slate-200 rounded w-20" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-4xl">
          <MessageSquare size={24} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No reviews yet</h3>
          <p className="mt-2 text-xs text-slate-500">Reviews will appear here once renters complete their bookings.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {reviews.map((r) => {
            const reviewer = r.reviewerId || {};
            const vehicle = r.vehicleId || {};

            return (
              <div key={r._id} className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{reviewer.name || 'Anonymous'}</h3>
                    <p className="text-xs text-violet-600 font-semibold mt-0.5">
                      {vehicle.brand} {vehicle.model || vehicle.name || 'Vehicle'}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(r.rating) ? 'text-yellow-400' : 'text-slate-200'}
                      fill={i < Math.floor(r.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="text-xs text-slate-600 ml-1.5 font-semibold">{r.rating} / 5</span>
                </div>

                {r.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{r.comment}&rdquo;
                  </p>
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
            Page {meta.page} of {meta.totalPages} · {meta.total} reviews
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

export default OwnerReviews;
