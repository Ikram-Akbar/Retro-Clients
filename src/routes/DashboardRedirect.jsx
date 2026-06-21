import { Navigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import { getDashboardBasePath, normalizeRole } from '../utils/dashboardRole';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center px-4 text-slate-600">Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardBasePath(normalizeRole(user.role))} replace />;
};

export default DashboardRedirect;
