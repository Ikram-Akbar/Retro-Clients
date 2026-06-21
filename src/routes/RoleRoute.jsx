import { Navigate, Outlet, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import { getDashboardBasePath, normalizeRole } from '../utils/dashboardRole';

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center px-4 text-slate-600">Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = normalizeRole(user.role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(role)) {
    return <Navigate to={getDashboardBasePath(role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
