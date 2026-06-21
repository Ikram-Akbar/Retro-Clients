import RoleRoute from './RoleRoute';

const OwnerRoute = () => <RoleRoute allowedRoles={['OWNER']} />;

export default OwnerRoute;
