import { Menu, X, Bell, ShoppingCart, ChevronDown, CarFront, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { getDashboardBasePath } from "../../utils/dashboardRole";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("rentro_theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("rentro_theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    setIsOpen(false);
  };

  const dashboardPath = user ? getDashboardBasePath(user.role) : "/dashboard";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Rentals", path: "/browse-rental" },
    { name: "How it works", path: "/how-it-works" },
    { name: "Contact Us", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/60 shadow-sm backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800" role="banner">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo - Rentro */}
          <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-wider text-slate-900 dark:text-white group">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-300">
              <CarFront size={22} className="stroke-[2.5]" />
            </span>
            <span className="font-extrabold uppercase tracking-widest text-lg">Rentro</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `py-2 font-bold text-sm tracking-wide transition uppercase cursor-pointer ${isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-450"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Panel */}
          <div className="hidden md:flex items-center gap-5">
            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-650 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-full border border-slate-200 bg-white text-slate-650 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700" aria-label="View notifications">
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* Shopping Cart with Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full border border-slate-200 bg-white text-slate-650 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/25 transition cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-700"
              aria-label="View shopping cart"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1.5 py-1 text-[10px] font-black leading-none text-white bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Login Option */}
            {loading ? (
              <div className="text-xs font-semibold text-slate-400">Loading...</div>
            ) : user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 transition cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                >
                  <img
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{user?.name}</span>
                    <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-350 uppercase tracking-wider">{user?.role}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl w-52 z-50 mt-2">
                  <li>
                    <Link to={dashboardPath} className="text-xs font-bold text-slate-700 dark:text-slate-250 py-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 uppercase">Dashboard</Link>
                  </li>
                  <li>
                    <button type="button" onClick={handleLogout} className="text-xs font-bold text-rose-600 py-2.5 px-4 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 uppercase text-left w-full">Logout</button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 font-bold text-sm text-slate-750 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 uppercase transition">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase rounded-xl shadow-md shadow-blue-500/10 transition">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-slide-in" role="navigation" aria-label="Mobile menu">
          <nav className="flex flex-col gap-3 px-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `block py-2.5 px-4 font-bold text-sm tracking-wide uppercase rounded-xl transition ${isActive ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"}`}
              >
                {link.name}
              </NavLink>
            ))}

            <hr className="border-slate-200 dark:border-slate-800 my-2" />

            <div className="flex items-center justify-between px-3 py-2">
              <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-blue-600 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold uppercase">View Cart</span>
              </Link>

              <div className="flex gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button className="relative p-2 text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                </button>
              </div>
            </div>

            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setIsOpen(false)} className="block text-center py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-bold uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition">Dashboard</Link>
                <button type="button" onClick={handleLogout} className="block text-center py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-sm font-bold uppercase hover:bg-rose-100 transition">Logout</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold uppercase hover:bg-blue-700 shadow-md shadow-blue-500/20 transition">Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
