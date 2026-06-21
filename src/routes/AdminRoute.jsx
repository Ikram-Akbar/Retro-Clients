import RoleRoute from './RoleRoute';

const AdminRoute = () => <RoleRoute allowedRoles={['ADMIN']} />;

export default AdminRoute;
