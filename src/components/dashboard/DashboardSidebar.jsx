import { NavLink, Link } from 'react-router';
import { X, CarFront } from 'lucide-react';
import { getDashboardNavigation } from '../../data/dashboardNavigation';
import { getDashboardRoleLabel } from '../../utils/dashboardRole';

const DashboardSidebar = ({ role, basePath, user, open, onClose, onLogout, mobile = false }) => {
  const items = getDashboardNavigation(role);

  const dashboardLink = items.find(item => item.slug === '');
  const resourceLinks = items.filter(item => item.slug !== '');

  const shellClass = mobile
    ? `fixed inset-y-0 left-0 z-50 w-[min(88vw,20rem)] flex flex-col transform bg-[#0F172A] px-5 py-6 text-white border-r border-slate-800 transition duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`
    : 'hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-80 lg:flex-col lg:bg-[#0F172A] lg:px-5 lg:py-6 lg:text-white lg:border-r lg:border-slate-800';

  const renderLink = (item) => {
    const Icon = item.icon;
    const to = item.slug ? `${basePath}/${item.slug}` : basePath;
    return (
      <NavLink
        key={item.label}
        to={to}
        end={!item.slug}
        onClick={mobile ? onClose : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`
        }
      >
        <Icon size={18} />
        <span className="text-sm font-semibold">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className={shellClass}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-550/20">
            <CarFront size={22} className="stroke-[2.5]" />
          </span>
          <span>
            <span className="block text-lg font-black text-white tracking-tight">Rentro</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {role} Dashboard
            </span>
          </span>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-2 text-slate-400 hover:text-white"
            aria-label="Close dashboard menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="mt-8 flex-1 flex flex-col justify-between overflow-y-auto pr-1">
        <div className="space-y-6">
          {/* Main Dashboard Link */}
          {dashboardLink && (
            <div className="space-y-1">
              {renderLink(dashboardLink)}
            </div>
          )}

          {/* Resources Group */}
          {resourceLinks.length > 0 && (
            <div className="space-y-2">
              <div className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Resources
              </div>
              <div className="space-y-1">
                {resourceLinks.map(renderLink)}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
