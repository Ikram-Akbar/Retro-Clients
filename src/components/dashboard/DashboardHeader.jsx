import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router';
import { getDashboardRoleLabel, getDashboardBasePath } from '../../utils/dashboardRole';

const DashboardHeader = ({ user, onMenuToggle, onLogout, role }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Member';
  const avatarSrc = user?.avatarUrl || user?.avatar || user?.image || user?.photoURL || user?.profileImage || user?.photo;
  const avatarText = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('').slice(0, 2) || 'M';
  const basePath = getDashboardBasePath(role);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/85 px-6 backdrop-blur-md">
      {/* Left side: Hamburger menu for mobile & Breadcrumbs/Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          type="button"
          className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:text-slate-900 lg:hidden transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <span className="text-[10px] font-bold tracking-widest text-violet-600 uppercase">Portal</span>
          <h1 className="text-base font-bold text-slate-900 hidden sm:block">
            {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} Dashboard
          </h1>
        </div>
      </div>

      {/* Right side: Notifications & User profile dropdown */}
      <div className="flex items-center gap-4">
        <Link
          to={role === 'ADMIN' ? '/dashboard/admin' : `${basePath}/notifications`}
          className="relative rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-violet-600 ring-2 ring-white" />
        </Link>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 relative" ref={dropdownRef}>
          <div className="hidden text-right md:block">
            <div className="text-sm font-semibold text-slate-900">{displayName}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {role}
            </div>
          </div>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
            aria-expanded={dropdownOpen}
          >
            <div className="h-10 w-10 overflow-hidden rounded-xl bg-violet-600 flex items-center justify-center text-white ring-1 ring-slate-200 shadow-sm">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-bold text-sm">{avatarText}</span>
              )}
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl focus:outline-none">
              <div className="flex flex-col items-start px-4 py-2.5 border-b border-slate-100 md:hidden w-full">
                <div className="font-semibold text-slate-900 truncate max-w-full text-sm">{displayName}</div>
                <div className="text-xs text-slate-500 truncate max-w-full">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
