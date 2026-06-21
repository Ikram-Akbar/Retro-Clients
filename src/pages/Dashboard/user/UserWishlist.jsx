import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Star } from 'lucide-react';
import TakaSign from '../../../components/TakaSign';
import { getWishlist, removeFromWishlist } from '../../../services/wishlistService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';

const UserWishlist = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await getWishlist();
      const list = unwrapPayload(res.data) || [];
      setWishlist(list);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (vehicleId) => {
    try {
      setRemovingId(vehicleId);
      await removeFromWishlist(vehicleId);
      setWishlist((prev) => prev.filter((item) => item.vehicleId?._id !== vehicleId));
      toast.success('Removed from wishlist');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to remove from wishlist';
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Wishlist</h2>
        <p className="text-sm text-slate-500 mt-1">Vehicles you have saved for potential bookings.</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => {
            const vehicle = item.vehicleId;
            if (!vehicle) return null;

            const vehicleImage = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300';
            
            return (
              <div key={item._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
                <div className="h-44 relative bg-slate-100">
                  <img src={vehicleImage} alt={vehicle.name} className="h-full w-full object-cover transition group-hover:scale-105 duration-350" />
                  <button
                    type="button"
                    disabled={removingId === vehicle._id}
                    onClick={() => handleRemove(vehicle._id)}
                    className="absolute top-4 right-4 rounded-full bg-white/80 p-2 text-rose-500 hover:bg-white transition hover:scale-110 cursor-pointer disabled:opacity-50 shadow-xs border border-slate-100"
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">{vehicle.type}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-violet-600 transition">
                      {vehicle.brand} {vehicle.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <span className="font-semibold text-slate-800">{vehicle.rating || '5.0'}</span>
                    <span>({vehicle.reviewsCount || 0} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Price Per Day</span>
                      <span className="flex items-center text-lg font-bold text-slate-900 mt-0.5">
                         <TakaSign size={16} className="text-slate-400" />
                        {vehicle.pricePerDay}
                      </span>
                    </div>
                    <Link
                      to={`/cars/${vehicle._id}`}
                      className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer shadow-xs"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Heart size={20} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="mt-2 text-xs text-slate-500">You can save rentals while browsing by clicking the heart icon.</p>
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
