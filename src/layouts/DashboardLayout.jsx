import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardContent from './../components/dashboard/DashboardContent';
import { getDashboardBasePath, normalizeRole } from '../utils/dashboardRole';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);
  const basePath = getDashboardBasePath(role);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex relative overflow-x-hidden">
      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar (hidden on mobile, fixed layout) */}
      <DashboardSidebar
        role={role}
        basePath={basePath}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        mobile={false}
      />

      {/* Mobile Sidebar (shown on mobile drawer via open state) */}
      <DashboardSidebar
        role={role}
        basePath={basePath}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        mobile={true}
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-80 min-h-screen">
        <DashboardHeader
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          role={role}
        />
        <DashboardContent>
          <Outlet />
        </DashboardContent>
      </div>
    </div>
  );
};

export default DashboardLayout;
