import { useEffect, useState, useCallback } from 'react';
import { Star, Trash2, RefreshCw, AlertCircle, MessageSquare, X } from 'lucide-react';
import { getReviews, deleteReview, updateReview } from '../../../services/reviewsService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';

const AdminReviews = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReviews({ page, limit: 10 });
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setReviews(list);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load reviews.');
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      confirmText: 'Delete review',
      cancelText: 'Keep review',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
      toast.success('Review deleted successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      setIsSavingEdit(true);
      await updateReview(editingReview._id, { comment: editComment, rating: editRating });
      setReviews((prev) => prev.map((r) => r._id === editingReview._id ? { ...r, comment: editComment, rating: editRating } : r));
      toast.success('Review updated successfully.');
      setEditingReview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update review.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Review Logs Moderation</h2>
        <p className="text-sm text-slate-500 mt-1">Audit and remove customer feedback and listing reviews.</p>
      </div>

      <div className="flex items-center gap-3">
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
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-4xl">
          <MessageSquare size={24} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
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
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review for:{' '}
                      <span className="text-slate-800 font-semibold">
                        {vehicle.brand} {vehicle.model || vehicle.name || 'Vehicle'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
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
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  &ldquo;{r.comment || r.review || 'No comment provided.'}&rdquo;
                </p>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setEditingReview(r); setEditComment(r.comment || r.review || ''); setEditRating(r.rating); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-205 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Edit Review
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === r._id}
                    onClick={() => handleDelete(r._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === r._id ? (
                      <span className="h-3 w-3 rounded-full border border-rose-500 border-t-transparent animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    {deletingId === r._id ? 'Deleting...' : 'Delete Review'}
                  </button>
                </div>
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
      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setEditingReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Modify Review</h3>
              <p className="text-xs text-slate-500">Edit the user feedback comment and rating</p>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEditRating(val)}
                      className={`p-1.5 rounded-lg border transition ${editRating === val ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      <Star size={16} fill={editRating >= val ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Comment</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-205 bg-white px-4 py-3 text-xs text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
                  placeholder="Leave comment..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
