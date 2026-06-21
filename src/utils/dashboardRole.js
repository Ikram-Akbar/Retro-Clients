export const DASHBOARD_BASE_PATHS = {
  USER: '/dashboard/renter',
  OWNER: '/dashboard/owner',
  ADMIN: '/dashboard/admin',
};

export const normalizeRole = (role) => {
  const value = String(role || 'USER').trim().toUpperCase();
  return DASHBOARD_BASE_PATHS[value] ? value : 'USER';
};

export const getDashboardBasePath = (role) => DASHBOARD_BASE_PATHS[normalizeRole(role)] || DASHBOARD_BASE_PATHS.USER;

export const getDashboardRoleLabel = (role) => normalizeRole(role).toLowerCase();
