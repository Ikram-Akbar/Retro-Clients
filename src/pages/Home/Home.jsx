import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Headphones, BadgePercent, ChevronRight, HelpCircle, Star } from "lucide-react";
import { getVehicles } from "../../services/vehiclesService";

const categories = [
  { name: "Car", icon: "🚗", count: "Explore Cars" },
  { name: "Bike", icon: "🏍️", count: "Explore Bikes" },
  { name: "Van", icon: "🚐", count: "Explore Vans" },
];

const brands = [
  { name: "Toyota", logo: "🇯🇵" },
  { name: "Honda", logo: "🏍️" },
  { name: "Audi", logo: "🇩🇪" },
  { name: "BMW", logo: "🏎️" },
  { name: "Ford", logo: "🇺🇸" },
  { name: "Tesla", logo: "⚡" },
];

const faqs = [
  { q: "How do I book a rental car online?", a: "Simply browse our available fleet, select your desired rental period, fill out the booking form on the car details page, and complete your checkout. We will hold a 50% security deposit, and the owner will verify your booking." },
  { q: "What documents are required to rent a vehicle?", a: "You need a valid driving license, a national ID card or passport, and a active credit card or mobile banking account for the security deposit." },
  { q: "Is there a mileage limit on rentals?", a: "Most of our listings have unlimited mileage, but individual owners might set limits. Check the specifications or policy notes on the specific vehicle details page." },
  { q: "How does the security deposit work?", a: "We hold a 50% deposit at checkout to secure the booking. Once the rental is completed without any damages, this deposit is released back to your payment account." },
];

const testimonials = [
  { name: "Sarah Kabir", role: "Business Traveler", comment: "The Tesla Model S was in immaculate condition. The checkout process took less than 2 minutes. Absolutely stellar service!", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
  { name: "Rafsan Ahmed", role: "Road Tripper", comment: "Rented the Ducati Panigale for a weekend ride. The transaction reference was instant, and the pickup location was very convenient.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
  { name: "Maria Khan", role: "Family Vacation", comment: "The Ford Transit Van made our family trip comfortable. Relocation fee was fair, and the vehicle was clean. Recommended!", rating: 4, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchLocation, setSearchLocation] = useState("");
  const [rentalType, setRentalType] = useState("Day");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles({ limit: 6 });
        const payload = res?.data?.data ?? res?.data ?? res;
        if (Array.isArray(payload)) {
          setVehicles(payload);
        } else if (payload && Array.isArray(payload.items)) {
          setVehicles(payload.items);
        }
      } catch (err) {
        console.error("Failed to fetch vehicles for home:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse-rental?location=${searchLocation}&type=${rentalType}`);
  };

  const filteredCars = activeTab === "All" 
    ? vehicles 
    : vehicles.filter(car => (car.vehicleType || car.type) === activeTab);

  return (
    <main className="bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#111113] text-white py-24 px-4 overflow-hidden">
        {/* Tyre Track Pattern Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15), transparent 40%), url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1400')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />

        <div className="relative max-w-7xl mx-auto text-center z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Verified Car Rentals
          </span>

          <h1 className="mt-8 max-w-4xl text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] uppercase text-white">
            Explore our <span className="text-amber-500">Verified & Professional</span> Cars
          </h1>

          <p className="mt-6 max-w-2xl text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Rent the best vehicle at the lowest price with Rentro. Simple pricing, verified hosts, and 24/7 dedicated support.
          </p>

          <Link to="/browse-rental" className="mt-8 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm uppercase shadow-xl shadow-amber-500/20 hover:scale-102 transition duration-300">
            Book a Car
          </Link>

          {/* Search Card Container */}
          <div className="mt-16 w-full max-w-5xl bg-white text-slate-900 rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8">
            {/* Day / Hour Selector Tabs */}
            <div className="flex justify-center md:justify-start gap-3 mb-6">
              <button 
                type="button" 
                onClick={() => setRentalType("Day")}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition ${rentalType === "Day" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >
                Rent By Day
              </button>
              <button 
                type="button" 
                onClick={() => setRentalType("Hour")}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition ${rentalType === "Hour" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >
                Rent By Hour
              </button>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={handleSearch} className="grid gap-5 md:grid-cols-4 items-end text-left">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Select Location</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-850 text-sm font-bold rounded-2xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Dropoff Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-850 text-sm font-bold rounded-2xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition duration-300"
              >
                <Search size={16} className="stroke-[2.5]" />
                Search Fleet
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Categories</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 uppercase">Featured Categories</h2>
          <p className="max-w-md mx-auto text-sm text-slate-500 font-semibold">Browse through our specialized vehicle categories tailored for comfort and speed.</p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/browse-rental?category=${cat.name}`}
              className="group bg-white border border-slate-200/60 rounded-3xl p-6 text-center shadow-xs hover:shadow-xl hover:border-amber-400/50 hover:-translate-y-1.5 transition duration-300 flex flex-col items-center cursor-pointer"
            >
              <div className="text-4xl group-hover:scale-110 transition duration-300">{cat.icon}</div>
              <h3 className="mt-4.5 text-base font-extrabold text-slate-950 uppercase group-hover:text-amber-500 transition">{cat.name}</h3>
              <span className="mt-1.5 text-xs text-slate-400 font-bold">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BEST PLATFORM FOR CAR RENTAL */}
      <section className="py-20 bg-white border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Left: Premium Car Display */}
          <div className="relative group overflow-hidden rounded-3xl border border-slate-100 shadow-2xl shadow-slate-950/5">
            <img
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000"
              alt="Premium Platform Cars"
              className="w-full h-96 object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 backdrop-blur-md">Rentro Selection</span>
                <h3 className="mt-3 text-2xl font-black text-white uppercase leading-tight">Ferrari 458 MM Speciale</h3>
              </div>
            </div>
          </div>

          {/* Right: Feature Columns */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 uppercase leading-tight">Best Platform for Car Rental</h2>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">We provide a premium, transparent rental process with no hidden costs, letting you select from verified vehicles across the country.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <span className="p-3 h-fit rounded-2xl bg-amber-500/10 text-amber-600">
                  <ShieldCheck size={20} className="stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-950 uppercase">Top-Notch Security</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">All vehicles undergo inspection, and deposit locks ensure complete peace of mind.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="p-3 h-fit rounded-2xl bg-amber-500/10 text-amber-600">
                  <Headphones size={20} className="stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-950 uppercase">24/7 Support</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">Our support lines are open day and night to assist you on the road.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="p-3 h-fit rounded-2xl bg-amber-500/10 text-amber-600">
                  <BadgePercent size={20} className="stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-950 uppercase">Flexible Pricing</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">Get hourly or daily packages, applying coupons to grab great discounts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="p-3 h-fit rounded-2xl bg-amber-500/10 text-amber-600">
                  <ArrowRight size={20} className="stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-950 uppercase">Easy Booking</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">Select locations, verify pricing breakdown, and pay with 1-click bank transfers.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. EXPLORE MOST POPULAR CARS */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Popular Cars</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 uppercase">Explore Most Popular Cars</h2>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["All", "Car", "Bike", "Van"].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition ${activeTab === tab ? "bg-slate-950 text-white" : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cars List Grid */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Popular Listings...</p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
              <p className="text-sm font-semibold">No vehicles found matching this category.</p>
            </div>
          ) : (
            filteredCars.map((car) => {
              const image = car.images?.[0]?.url || car.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=500';
              const title = car.title || car.name || `${car.brand || ''} ${car.model || ''}`;
              const category = car.vehicleType || car.type || 'Vehicle';
              const price = car.pricePerDay || car.price || 0;
              const rating = car.averageRating || car.rating || '4.8';
              const carId = car._id || car.id;

              return (
                <article key={carId} className="group bg-white border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col">
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-4 right-4 rounded-full border border-slate-100 bg-white/95 px-3 py-1 text-xs font-bold text-amber-600 shadow-xs backdrop-blur-xs">
                      {category}
                    </span>
                    <span className="absolute top-4 left-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-yellow-400 backdrop-blur-xs flex items-center gap-1">
                      <Star size={11} className="fill-yellow-400 stroke-none" />
                      {rating}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950 uppercase truncate group-hover:text-amber-500 transition">{title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{car.brand}</span>
                        <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{car.model}</span>
                        <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{car.year}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <span className="block text-slate-400 uppercase tracking-widest text-[9px] font-bold">Daily Rate</span>
                        <p className="text-xl font-black text-amber-600 mt-0.5">
                          ৳{price.toLocaleString()}
                          <span className="text-xs text-slate-500 font-semibold lowercase"> / day</span>
                        </p>
                      </div>

                      <Link
                        to={/^[a-fA-F0-9]{24}$/.test(carId) ? `/cars/${carId}` : `/browse-rental`}
                        className="inline-flex items-center justify-center gap-1 px-4.5 py-3 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-xs uppercase transition cursor-pointer"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* 5. RENTS BY BRANDS */}
      <section className="py-16 bg-[#111113] text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Trusted Partnerships</span>
            <h3 className="text-xl font-bold uppercase text-slate-300">Rent by Brands</h3>
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {brands.map((b) => (
              <Link
                key={b.name}
                to={`/browse-rental?brand=${b.name}`}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/40 hover:bg-white/10 transition cursor-pointer"
              >
                <span className="text-2xl">{b.logo}</span>
                <span className="font-extrabold text-sm uppercase text-slate-200">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. RENT OUR CARS IN 3 STEPS */}
      <section className="py-20 max-w-7xl mx-auto px-4 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 uppercase">Rent Our Cars In 3 Steps</h2>
          <p className="max-w-md mx-auto text-sm text-slate-500 font-semibold">Our platform is structured to ensure you get keys in hand with minimal effort.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-black text-amber-600">01</span>
            <h4 className="text-lg font-extrabold text-slate-950 uppercase">Choose Vehicle</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Search through SUVs, Coupes, or Sedans and check detailed specifications and live availability calendar.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-black text-amber-600">02</span>
            <h4 className="text-lg font-extrabold text-slate-950 uppercase">Book Your Ride</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Select rental dates, locations, and extras. Pay the deposit through bank transfer, cards, or PayPal.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-black text-amber-600">03</span>
            <h4 className="text-lg font-extrabold text-slate-950 uppercase">Enjoy Journey</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Meet the owner at the pickup location, perform a quick check, and hit the open road with 24/7 support.</p>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER FEEDBACK & FAQ */}
      <section className="py-20 bg-slate-100 border-t border-slate-200/50 px-4">
        <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-2">
          
          {/* Left: Testimonials */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Reviews</span>
              <h3 className="text-3xl font-extrabold text-slate-950 uppercase leading-none">Our Clients Feedback</h3>
            </div>

            <div className="space-y-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase">{t.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{t.role}</span>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-yellow-400 stroke-none" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed italic">"{t.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: FAQs */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Questions</span>
              <h3 className="text-3xl font-extrabold text-slate-950 uppercase leading-none">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="collapse collapse-plus bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                  <input type="radio" name="faq-accordion" defaultChecked={idx === 0} /> 
                  <div className="collapse-title text-sm font-extrabold text-slate-900 uppercase flex items-center gap-2">
                    <HelpCircle size={16} className="text-amber-500 flex-shrink-0" />
                    {faq.q}
                  </div>
                  <div className="collapse-content"> 
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-55 pt-3.5 mt-1">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
};

export default Home;