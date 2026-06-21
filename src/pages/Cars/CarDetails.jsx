import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getVehicle, getVehicleAvailability } from '../../services/vehiclesService';
import { getVehicleReviews } from '../../services/reviewsService';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import { MapPin, Calendar, Clock, Star, Shield, HelpCircle, User, Fuel, CalendarDays, Key, Settings, Compass, HelpCircle as HelpIcon, ArrowLeft, ArrowRight, X, Heart } from 'lucide-react';
import { addToWishlist, getWishlist, removeFromWishlist } from '../../services/wishlistService';
import { unwrapPayload } from '../../api/tokenUtils';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, calculateBreakdown } = useCart();
  const toast = useToast();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Form states
  const [rentalType, setRentalType] = useState('Day');
  const [pickupLocation, setPickupLocation] = useState('Big Ben');
  const [dropoffLocation, setDropoffLocation] = useState('Palace of Westminster');

  // Set default dates: tomorrow to 3 days after tomorrow
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('16:20');
  const [dropoffTime, setDropoffTime] = useState('16:20');

  const [selectedExtras, setSelectedExtras] = useState(['Child Safety Seats', 'GPS Navigation', 'Wi-Fi Hotspot']);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const res = await getVehicle(id);
        const data = res?.data?.data ?? res?.data ?? res;
        if (data && data.title) {
          setVehicle(data);
          if (data.location) {
            setPickupLocation(data.location);
          }
        } else {
          setVehicle(null);
        }

        const reviewsRes = await getVehicleReviews(id);
        const reviewsData = reviewsRes?.data?.data ?? reviewsRes?.data ?? [];
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to load vehicle details:", err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const checkLiveAvailability = async () => {
      try {
        setIsCheckingAvailability(true);
        const start = `${startDate}T${pickupTime}:00`;
        const end = `${endDate}T${dropoffTime}:00`;
        const res = await getVehicleAvailability(id, { startDate: start, endDate: end });
        const data = res?.data?.data ?? res?.data ?? res;
        setAvailabilityStatus(data.available ? 'available' : 'unavailable');
      } catch (err) {
        console.error("Failed to check availability:", err);
        setAvailabilityStatus(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkLiveAvailability();
  }, [id, startDate, endDate, pickupTime, dropoffTime]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user) return;
      try {
        const res = await getWishlist();
        const list = unwrapPayload(res.data) || [];
        const found = list.some(item => item.vehicleId?._id === id);
        setIsInWishlist(found);
      } catch (err) {
        console.error("Failed to check wishlist status:", err);
      }
    };
    checkWishlistStatus();
  }, [id, user]);

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.warning("Please log in to manage your wishlist.");
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        toast.success("Removed from wishlist");
        setIsInWishlist(false);
      } else {
        await addToWishlist({ vehicleId: id });
        toast.success("Saved to wishlist");
        setIsInWishlist(true);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to update wishlist";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Vehicle Profile...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase">Vehicle Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The requested listing is unavailable or has been deleted.</p>
        <Link to="/browse-rental" className="mt-6 inline-flex px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs">Back to Fleet</Link>
      </div>
    );
  }

  // Calculate pricing breakdown dynamically
  const startDateTime = new Date(`${startDate}T${pickupTime}`);
  const endDateTime = new Date(`${endDate}T${dropoffTime}`);
  const durationMs = endDateTime - startDateTime;
  const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

  const pricing = calculateBreakdown(
    vehicle,
    days,
    selectedExtras,
    pickupLocation,
    dropoffLocation
  );

  const toggleExtra = (extraName) => {
    setSelectedExtras(prev =>
      prev.includes(extraName)
        ? prev.filter(e => e !== extraName)
        : [...prev, extraName]
    );
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please log in to book this ride.");
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    if (availabilityStatus === 'unavailable') {
      toast.error('This vehicle is not available for the selected dates.');
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please specify pickup and dropoff dates.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Dropoff date must be after pickup date.");
      return;
    }

    // Prepare item for cart
    const item = {
      vehicle,
      rentalType,
      pickupLocation,
      dropoffLocation,
      startDate: `${startDate}T${pickupTime}:00`,
      endDate: `${endDate}T${dropoffTime}:00`,
      extras: selectedExtras,
    };

    addToCart(item);
    navigate('/cart');
  };

  const imagesList = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : [{ url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" }];

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Back Link & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/browse-rental" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 uppercase transition">
            <ArrowLeft size={14} />
            Back to fleet
          </Link>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Home / Rentals / <span className="text-slate-700">{vehicle.title || vehicle.name}</span>
          </div>
        </div>

        {/* Header Grid */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">Verified</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{vehicle.vehicleType || 'Car'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 uppercase">{vehicle.title || vehicle.name}</h1>
            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1 font-semibold uppercase">
              <MapPin size={13} className="text-slate-400" />
              {vehicle.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleWishlist}
              className={`flex items-center justify-center p-3.5 rounded-2xl border transition cursor-pointer shadow-xs ${
                isInWishlist
                  ? 'bg-rose-50 border-rose-100 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-50'
              }`}
              title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 stroke-none" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-700">{vehicle.averageRating || '5.0'}</span>
              <span className="text-xs font-bold text-slate-400">({vehicle.reviewCount || '12'} reviews)</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          {/* Left Panel: Gallery + Specs + Info */}
          <div className="space-y-8">

            {/* Gallery Component */}
            <div className="space-y-4">
              <div className="relative h-[460px] w-full rounded-3xl bg-slate-900 border border-slate-200/50 overflow-hidden shadow-md">
                <img
                  src={imagesList[activeImageIdx]?.url || imagesList[activeImageIdx]}
                  alt={vehicle.title || vehicle.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Gallery Nav Arrows */}
                <button
                  type="button"
                  onClick={() => setActiveImageIdx(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 text-slate-800 hover:bg-amber-500 hover:text-slate-950 shadow-md cursor-pointer transition"
                  aria-label="Previous image"
                >
                  <ArrowLeft size={16} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx(prev => (prev + 1) % imagesList.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 text-slate-800 hover:bg-amber-500 hover:text-slate-950 shadow-md cursor-pointer transition"
                  aria-label="Next image"
                >
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Thumbnails row */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-20 w-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 cursor-pointer transition ${activeImageIdx === idx ? 'border-amber-500 shadow-md' : 'border-slate-200 hover:border-slate-35'}`}
                  >
                    <img src={img.url || img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Overview / Specs Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xs space-y-6">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Vehicle Specifications</h3>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Key size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</span>
                    <span className="block text-sm font-extrabold text-slate-850 uppercase">{vehicle.brand}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Settings size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</span>
                    <span className="block text-sm font-extrabold text-slate-850 uppercase">{vehicle.model}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year</span>
                    <span className="block text-sm font-extrabold text-slate-850">{vehicle.year}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Compass size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transmission</span>
                    <span className="block text-sm font-extrabold text-slate-850 uppercase">Automatic</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Fuel size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Type</span>
                    <span className="block text-sm font-extrabold text-slate-850 uppercase">Octane / Super</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <User size={18} />
                  </span>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
                    <span className="block text-sm font-extrabold text-slate-850 uppercase">5 Seats</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xs space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Description & Listing</h3>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Car FAQs */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xs space-y-5">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Frequently Asked Questions</h3>

              <div className="space-y-3">
                <div className="collapse collapse-arrow bg-slate-50 border border-slate-100 rounded-2xl">
                  <input type="radio" name="car-faq-accordion" defaultChecked />
                  <div className="collapse-title text-sm font-extrabold text-slate-950 uppercase">
                    Is insurance included in the rental cost?
                  </div>
                  <div className="collapse-content">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-150/40 pt-3 mt-1">Yes, basic liability insurance is included. However, you can add collision damage waivers or theft protection at the counter during pickup.</p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-slate-50 border border-slate-100 rounded-2xl">
                  <input type="radio" name="car-faq-accordion" />
                  <div className="collapse-title text-sm font-extrabold text-slate-955 uppercase">
                    What happens if I return the car late?
                  </div>
                  <div className="collapse-content">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-150/40 pt-3 mt-1">A grace period of 59 minutes is allowed. Late returns exceeding this will incur an hourly charge proportional to the daily rate.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xs space-y-6">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Customer Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100">
                  {reviews.map((rev, idx) => (
                    <div key={rev._id || idx} className="pt-5 first:pt-0 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 text-xs font-bold border">
                            {rev.userId?.name?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">{rev.userId?.name || 'Anonymous Renter'}</span>
                            <span className="block text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg border">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} className="fill-yellow-400 stroke-none" />
                          ))}
                          <span className="text-[10px] font-black text-slate-600 ml-1">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-550 font-semibold leading-relaxed pl-10">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet. Be the first to rent and leave a review!</p>
              )}
            </div>

          </div>

          {/* Right Panel: Booking Sidebar */}
          <div>
            <div className="sticky top-24 bg-white border border-slate-200/60 rounded-3xl shadow-xl p-6 space-y-6">

              {/* Price Tag */}
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Rental Price</span>
                <p className="text-3xl font-black text-amber-500 mt-1">
                  ৳{vehicle.pricePerDay}
                  <span className="text-sm text-slate-400 font-bold lowercase tracking-normal"> / day</span>
                </p>
              </div>

              {/* Form Toggles */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Book This Vehicle</h4>

                {/* Type toggler */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-150/40 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRentalType('Day')}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition ${rentalType === 'Day' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    By Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalType('Hour')}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition ${rentalType === 'Hour' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    By Hour
                  </button>
                </div>

                {/* Pickup Location */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    placeholder="Pickup location"
                  />
                </div>

                {/* Dropoff Location */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dropoff Location</label>
                  <input
                    type="text"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    placeholder="Dropoff location"
                  />
                </div>

                {/* Dates pickers */}
                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dropoff Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dropoff Time</label>
                    <input
                      type="time"
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-205 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Extra Services checkboxes */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Extra Services</label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes('Child Safety Seats')}
                        onChange={() => toggleExtra('Child Safety Seats')}
                        className="checkbox checkbox-sm checkbox-primary rounded-md"
                      />
                      <span className="text-xs font-bold text-slate-700">Child Safety Seats</span>
                    </div>
                    <span className="text-xs font-black text-amber-600">৳10.00</span>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes('Wi-Fi Hotspot')}
                        onChange={() => toggleExtra('Wi-Fi Hotspot')}
                        className="checkbox checkbox-sm checkbox-primary rounded-md"
                      />
                      <span className="text-xs font-bold text-slate-700">Wi-Fi Hotspot</span>
                    </div>
                    <span className="text-xs font-black text-amber-600">৳10 / day</span>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes('GPS Navigation')}
                        onChange={() => toggleExtra('GPS Navigation')}
                        className="checkbox checkbox-sm checkbox-primary rounded-md"
                      />
                      <span className="text-xs font-bold text-slate-700">Navigation</span>
                    </div>
                    <span className="text-xs font-black text-amber-600">৳10.00</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Price Calculation Breakdown */}
              <div className="border-t border-slate-150/60 pt-5 space-y-3 text-xs">
                <h5 className="font-extrabold text-slate-800 uppercase tracking-wide">Pricing Breakdown</h5>

                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Base Rental: ৳{pricing.baseRental.rate.toFixed(2)} × {days} days</span>
                  <span className="font-bold text-slate-700">৳{pricing.baseRental.total.toFixed(2)}</span>
                </div>

                {pricing.childSafetySeats.selected && (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Child Safety Seats (one-time)</span>
                    <span className="font-bold text-slate-700">৳{pricing.childSafetySeats.total.toFixed(2)}</span>
                  </div>
                )}

                {pricing.wifiHotspot.selected && (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Wi-Fi Hotspot: ৳10.00 × {days} days</span>
                    <span className="font-bold text-slate-700">৳{pricing.wifiHotspot.total.toFixed(2)}</span>
                  </div>
                )}

                {pricing.navigation.selected && (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Navigation (one-time)</span>
                    <span className="font-bold text-slate-700">৳{pricing.navigation.total.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Relocation Fee</span>
                  <span className="font-bold text-slate-700">৳{pricing.relocationFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Deposit: ৳{pricing.subtotal.toFixed(2)} × 50%</span>
                  <span className="font-bold text-slate-700">৳{pricing.deposit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-black text-sm text-slate-900 border-t border-dashed border-slate-200 pt-3">
                  <span>Total Amount</span>
                  <span className="text-amber-500">৳{pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Live Availability Status */}
              {startDate && endDate && (
                <div className="text-center py-2.5 px-4 rounded-xl text-xs font-bold border">
                  {isCheckingAvailability ? (
                    <span className="text-slate-405 flex items-center justify-center gap-1.5 animate-pulse">
                      Checking availability...
                    </span>
                  ) : availabilityStatus === 'available' ? (
                    <span className="text-emerald-700 bg-emerald-50 border-emerald-100 flex items-center justify-center gap-1.5 py-0.5 rounded-lg">
                      ✓ Vehicle is available for these dates
                    </span>
                  ) : availabilityStatus === 'unavailable' ? (
                    <span className="text-rose-700 bg-rose-50 border-rose-100 flex items-center justify-center gap-1.5 py-0.5 rounded-lg">
                      ✕ Vehicle is booked for these dates
                    </span>
                  ) : (
                    <span className="text-slate-500">Live availability status checked</span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleBookNow}
                disabled={availabilityStatus === 'unavailable'}
                className={`w-full py-4.5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 transition duration-300
    ${availabilityStatus === 'unavailable'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                  }`}
              >
                {user ? 'Book Now' : 'Login to Book'}
              </button>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

export default CarDetails;
