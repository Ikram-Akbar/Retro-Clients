import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import useVehicles from '../../hooks/useVehicles';
import { MapPin, Search, SlidersHorizontal, CarFront } from 'lucide-react';

const BrowseRental = () => {
  const [searchParams] = useSearchParams();
  const urlLocation = searchParams.get('location') || 'All';
  const urlType = searchParams.get('type') || searchParams.get('category') || 'All';

  const {
    vehicles,
    loading,
    error,
    query,
    setQuery,
    type,
    setType,
    location,
    setLocation,
    refetch,
  } = useVehicles({
    initialLocation: urlLocation,
    initialType: urlType,
  });

  useEffect(() => {
    // Initial load handled by hook
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-[10px] font-bold tracking-widest text-violet-600 uppercase bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
            Explorer
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-3">Browse Rental Fleet</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Find the perfect vehicle for your next commute, road trip, or family event with clear daily rates.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-5 mb-10">
          <div className="grid gap-4 md:grid-cols-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vehicle model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white"
              />
            </div>

            {/* Vehicle Type Dropdown */}
            <div className="relative">
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none transition focus:border-violet-500 focus:bg-white cursor-pointer"
              >
                <option value="">All Vehicle Types</option>
                <option value="Car">Cars</option>
                <option value="Bike">Bikes</option>
                <option value="Van">Vans</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="relative">
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none transition focus:border-violet-500 focus:bg-white cursor-pointer"
              >
                <option value="">All Locations</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>

            {/* Search Trigger Button */}
            <button 
              type="button" 
              onClick={() => refetch()} 
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-3 transition shadow-md shadow-violet-200 cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Filter Fleet
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Fleet Listings...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center text-rose-700 max-w-md mx-auto">
            <p className="text-sm font-semibold">Failed to retrieve vehicle database items.</p>
          </div>
                ) : vehicles.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
            <p className="text-sm font-semibold">No vehicles found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const image = vehicle.images?.[0]?.url || vehicle.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=500';
              const title = vehicle.title || vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`;
              const category = vehicle.vehicleType || vehicle.type || 'Vehicle';
              const price = vehicle.pricePerDay || vehicle.price || 0;

              return (
                <div 
                  key={vehicle._id || vehicle.id} 
                  className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Vehicle Image Cover */}
                  <div className="h-56 w-full relative bg-slate-100 overflow-hidden">
                    <img 
                      src={image} 
                      alt={title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <span className="absolute top-4 right-4 rounded-full border border-violet-100 bg-white/95 px-3 py-1 text-xs font-bold tracking-wide text-violet-600 shadow-xs backdrop-blur-xs">
                      {category}
                    </span>
                  </div>

                  {/* Vehicle Body Info */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <Link to={`/cars/${vehicle._id || vehicle.id}`}>
                        <h3 className="text-xl font-bold text-slate-900 hover:text-amber-500 transition truncate cursor-pointer" title={title}>
                          {title}
                        </h3>
                      </Link>
                      <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                        <MapPin size={13} className="text-slate-400" />
                        {vehicle.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <span className="block text-slate-400 uppercase tracking-widest text-[9px] font-bold">Daily Rate</span>
                        <p className="text-2xl font-extrabold text-amber-500 mt-0.5">
                          ৳{price.toLocaleString()}
                          <span className="text-xs text-slate-500 font-semibold lowercase"> / day</span>
                        </p>
                      </div>

                      <Link 
                        to={`/cars/${vehicle._id || vehicle.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs px-4 py-2.5 transition cursor-pointer"
                      >
                        <CarFront size={12} />
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseRental;