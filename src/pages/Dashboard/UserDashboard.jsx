import { useMemo, useState } from "react";
import { Bell, CalendarRange, CreditCard, LayoutDashboard, RefreshCcw, ShieldCheck, UserCircle2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const profileFields = [
  { label: "Email", key: "email" },
  { label: "Role", key: "role" },
  { label: "Phone", key: "phone" },
  { label: "Location", key: "location" },
  { label: "Member since", key: "createdAt" },
  { label: "User ID", key: "id" },
];

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "Not available yet";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  return JSON.stringify(value);
};

const initialsFromUser = (user) => {
  const source = user?.name || user?.fullName || user?.email || "R";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "R";
};

const UserDashboard = () => {
  const { user, fetchCurrentUser, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return "Member";
    return user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Member";
  }, [user]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Not available yet";
    const date = new Date(user.createdAt);
    return Number.isNaN(date.getTime()) ? String(user.createdAt) : date.toLocaleDateString();
  }, [user]);

  const stats = [
    {
      label: "Profile status",
      value: user ? "Active" : "Pending",
      icon: ShieldCheck,
      hint: user ? "Your account is connected to the auth service." : "No profile data returned yet.",
    },
    {
      label: "Open bookings",
      value: user?.bookingCount ?? user?.bookingsCount ?? "Soon",
      icon: CalendarRange,
      hint: "This will populate when booking APIs are connected.",
    },
    {
      label: "Saved items",
      value: user?.savedCount ?? user?.wishlistCount ?? "Soon",
      icon: LayoutDashboard,
      hint: "Wishlist and saved vehicle data will appear here later.",
    },
    {
      label: "Billing",
      value: user?.balance ?? user?.walletBalance ?? "Soon",
      icon: CreditCard,
      hint: "Payment and invoice data can be wired in once the API is ready.",
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUser();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !user) {
    return (
      <main className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-200 backdrop-blur-xl">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.22),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_56%,#f8fafc_56%,#f8fafc_100%)] text-slate-950">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <UserCircle2 size={16} />
                Logged in via auth API
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This dashboard is wired to the current authentication endpoint. It shows the profile data we can trust today and leaves clear slots for booking, listing, and payment APIs when you add them.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing" : "Refresh profile"}
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200">
                <Bell size={16} />
                Next: booking and rental APIs
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span className="text-sm font-medium">{stat.label}</span>
                    <Icon size={18} />
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-white">{stat.value}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{stat.hint}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Account details from the auth API</h2>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                {initialsFromUser(user)}
              </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {profileFields.map((field) => {
                const value = field.key === "createdAt" ? memberSince : user?.[field.key];
                return (
                  <div key={field.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
                    <dd className="mt-2 break-words text-base font-semibold text-slate-950">
                      {formatValue(value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">Roadmap</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ready for the next API slices</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Right now the dashboard stays honest: it only renders auth-backed data and labeled placeholders where the rest of the backend will plug in.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Bookings</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">Upcoming trips, status, pickup date, and cancellation actions.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Saved rentals</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">Favorite cars, bikes, and shortlists for quick rebooking.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Payments</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">Invoices, wallet balance, and transaction history once available.</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;