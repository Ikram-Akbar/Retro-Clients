import { Link } from "react-router";

const categories = [
  { name: "Cars", icon: "🚗", count: "120+" },
  { name: "Bikes", icon: "🏍️", count: "80+" },
  { name: "Vans", icon: "🚐", count: "35+" },
  { name: "Trucks", icon: "🚚", count: "20+" },
];

const featuredRentals = [
  {
    id: 1,
    name: "Toyota Corolla",
    price: 3500,
    tag: "Best Seller",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200",
  },
  {
    id: 2,
    name: "Honda CBR 150R",
    price: 1200,
    tag: "Instant Book",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200",
  },
  {
    id: 3,
    name: "Toyota Hiace",
    price: 5000,
    tag: "Family Trips",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200",
  },
];

const trustStats = [
  { value: "12k+", label: "Trips completed" },
  { value: "4.9/5", label: "Average rating" },
  { value: "24/7", label: "Support" },
];

const features = [
  {
    title: "Fast discovery",
    description: "Find the right vehicle quickly with smart categories and curated recommendations.",
  },
  {
    title: "Trusted listings",
    description: "Browse verified hosts and high-quality vehicles with clear pricing and availability.",
  },
  {
    title: "Smooth booking",
    description: "Simple checkout and booking steps designed for a frictionless user experience.",
  },
];

const Home = () => {
  return (
    <main className="bg-slate-950 text-white overflow-hidden">
      <section className="relative isolate">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#f8fafc_48%,#f8fafc_100%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-128 blur-3xl"
          style={{
            backgroundImage:
              "linear-gradient(120deg,rgba(15,23,42,0.04),rgba(99,102,241,0.08),rgba(168,85,247,0.08))",
          }}
        />

        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-16 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-200 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Premium vehicle rentals across Bangladesh
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Rent vehicles with a cleaner, faster, more modern experience.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Discover cars, bikes, vans, and trucks from trusted owners, then book in a few simple steps.
              Built to feel premium, calm, and easy to use.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/browse-rental"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Browse Rentals
              </Link>

              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                See How It Works
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-md"
                >
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="absolute inset-0 -z-10 mx-auto h-112 w-md rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="w-full max-w-xl rounded-4xl border border-white/15 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400"
                  alt="Featured vehicle"
                  className="h-80 w-full object-cover"
                />

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Featured this week</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Toyota Corolla 2024</h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                      4.9 Rating
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
                    <div className="rounded-2xl bg-white/5 p-3">
                      <div className="font-semibold text-white">AC</div>
                      <div>Comfort</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <div className="font-semibold text-white">Auto</div>
                      <div>Transmission</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <div className="font-semibold text-white">5 seats</div>
                      <div>Capacity</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-4">
                    <div>
                      <p className="text-sm text-slate-300">Starting from</p>
                      <p className="text-2xl font-semibold text-white">৳3,500/day</p>
                    </div>
                    <Link
                      to="/browse-rental"
                      className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Book now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto -mt-4 max-w-7xl px-4 pb-20 lg:px-8">
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <input
                type="text"
                placeholder="Search location"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
              />
              <input
                type="date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
              />
              <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white">
                <option>All categories</option>
                <option>Car</option>
                <option>Bike</option>
                <option>Van</option>
                <option>Truck</option>
              </select>
              <Link
                to="/browse-rental"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Categories</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Browse by vehicle type</h2>
            </div>
            <p className="max-w-xl text-slate-600">
              A cleaner visual hierarchy helps users jump straight to the vehicle type they need.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{category.icon}</div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                    {category.count}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-slate-950">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore curated listings in this category with consistent pricing and clear availability.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Featured</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Premium rentals for your next trip</h2>
            </div>
            <Link to="/browse-rental" className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900">
              View all rentals
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredRentals.map((vehicle) => (
              <article
                key={vehicle.id}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
                    {vehicle.tag}
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm">
                    ★ {vehicle.rating}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-950">{vehicle.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">Verified owner and flexible pickup options</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">From</p>
                      <p className="text-2xl font-semibold text-indigo-700">৳{vehicle.price}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Link
                      to="/browse-rental"
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:border-indigo-300 hover:text-indigo-700"
                    >
                      View details
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Book now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Why Rentro</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Designed to feel polished and effortless</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                The interface uses stronger spacing, softer surfaces, higher contrast text, and clearer call to action placement.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Modern UI', 'Fast search', 'Verified listings', 'Responsive layout'].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-semibold text-indigo-700">
                    0{index + 1}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">Get started</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Ready for a cleaner rental experience?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Explore the catalog, compare options, and move to booking with a layout built for clarity and trust.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/browse-rental"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Explore Rentals
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;