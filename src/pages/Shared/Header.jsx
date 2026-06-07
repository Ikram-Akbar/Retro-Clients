import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse Rentals", path: "/browse-rental" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "About", path: "/about" },
  ];

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Member";
  const avatarSrc = user?.avatar || user?.image || user?.photoURL || user?.profileImage || user?.photo;
  const avatarText = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "M";

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600"
          >
            Rentro
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-medium transition ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `font-medium transition ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 pr-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-sm font-semibold text-white ring-2 ring-white">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      avatarText
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </span>
                    <span className="block text-xs text-slate-500">Open dashboard</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 font-medium text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t" role="navigation" aria-label="Mobile menu">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `font-medium ${
                      isActive
                        ? "text-indigo-600"
                        : "text-gray-700"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      avatarText
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </span>
                    <span className="block text-xs text-slate-500">View dashboard</span>
                  </span>
                </Link>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-slate-900 text-white text-center py-2 rounded-xl"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="font-medium text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white text-center py-2 rounded-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};



export default Header;