import { Navigate, Outlet } from 'react-router';
import useAuth from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-slate-600">
        Loading your account...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
