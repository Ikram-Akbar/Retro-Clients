import { ShieldAlert, UserCheck, Shield, Search, AlertCircle, RefreshCw, X, User, Plus } from 'lucide-react';
import { getUsers, toggleUserStatus, getUserById, makeAdmin, makeOwner, createUser } from '../../../services/usersService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';
import useAuth from '../../../hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';

const roleConfig = {
  admin: { label: 'ADMIN', className: 'bg-violet-50 text-violet-700 border-violet-100' },
  owner: { label: 'OWNER', className: 'bg-sky-50 text-sky-700 border-sky-100' },
  user: { label: 'USER', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const AdminUsers = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // New admin / user creation states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    phoneNumber: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const handleMakeAdmin = async (id) => {
    const confirmed = await confirm({
      title: 'Make Admin',
      message: 'Are you sure you want to promote this user to Admin? They will receive full administrative rights.',
      confirmText: 'Yes, Make Admin',
      cancelText: 'Cancel',
      isDestructive: false,
    });
    if (!confirmed) return;

    try {
      const res = await makeAdmin(id);
      const updatedUser = unwrapPayload(res.data);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: 'admin' } : u))
      );
      setSelectedUser(updatedUser);
      toast.success('User promoted to Admin successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to promote user to Admin.');
    }
  };

  const handleMakeOwner = async (id) => {
    const confirmed = await confirm({
      title: 'Make Owner',
      message: 'Are you sure you want to promote this user to Fleet Owner? They will be able to list and manage their own vehicles.',
      confirmText: 'Yes, Make Owner',
      cancelText: 'Cancel',
      isDestructive: false,
    });
    if (!confirmed) return;

    try {
      const res = await makeOwner(id);
      const updatedUser = unwrapPayload(res.data);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: 'owner' } : u))
      );
      setSelectedUser(updatedUser);
      toast.success('User promoted to Owner successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to promote user to Owner.');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    try {
      setCreatingUser(true);
      await createUser(newUserData);
      toast.success(`${newUserData.role === 'admin' ? 'Admin' : newUserData.role === 'owner' ? 'Owner' : 'User'} created successfully!`);
      setCreateModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'admin', phoneNumber: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setLoadingUserDetails(true);
      setUserModalOpen(true);
      const res = await getUserById(id);
      const data = unwrapPayload(res.data);
      setSelectedUser(data);
    } catch (err) {
      toast.error('Failed to load user details.');
      console.error(err);
      setUserModalOpen(false);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await getUsers(params);
      const data = unwrapPayload(res.data);
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'suspend' : 'activate';
    const confirmed = await confirm({
      title: `${currentStatus ? 'Suspend' : 'Activate'} User`,
      message: `Are you sure you want to ${action} this user's account? ${currentStatus ? 'They will lose access to the portal immediately.' : 'They will regain access to their account.'
        }`,
      confirmText: `Yes, ${action}`,
      cancelText: 'Cancel',
      isDestructive: currentStatus,
    });
    if (!confirmed) return;

    try {
      setTogglingId(id);
      await toggleUserStatus(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u))
      );
      toast.success(`User account ${currentStatus ? 'suspended' : 'activated'} successfully.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Users</h2>
        <p className="text-sm text-slate-500 mt-1">Manage user roles, moderation rights, and account access controls.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer"
          >
            Search
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={fetchUsers}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer flex items-center gap-1.5 ml-auto"
        >
          <Plus size={14} />
          Create Admin
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">User Details</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="p-4 pr-6"><div className="h-6 bg-slate-200 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((userItem) => {
                  const roleCfg = roleConfig[userItem.role?.toLowerCase()] || roleConfig.user;
                  return (
                    <tr key={userItem._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 pl-6">
                        <div>
                          <div className="font-semibold text-slate-900">{userItem.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{userItem.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${roleCfg.className}`}>
                          <Shield size={11} />
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${userItem.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {userItem.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(userItem._id)}
                            className="text-xs font-semibold text-slate-500 hover:text-violet-650 transition cursor-pointer"
                          >
                            Details
                          </button>
                          {userItem.email === currentUser?.email || userItem._id === currentUser?._id ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                              Current Session
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={togglingId === userItem._id}
                              onClick={() => handleToggleStatus(userItem._id, userItem.isActive)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-50 ${userItem.isActive
                                  ? 'bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700'
                                  : 'bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700'
                                }`}
                            >
                              {togglingId === userItem._id ? (
                                <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
                              ) : userItem.isActive ? (
                                <ShieldAlert size={12} />
                              ) : (
                                <UserCheck size={12} />
                              )}
                              {togglingId === userItem._id
                                ? 'Updating...'
                                : userItem.isActive
                                  ? 'Suspend'
                                  : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} · {meta.total} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* User Details Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => { setUserModalOpen(false); setSelectedUser(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="text-violet-650" size={20} /> Platform User Profile
              </h3>
              <p className="text-xs text-slate-500">Detailed account registration details</p>
            </div>

            {loadingUserDetails ? (
              <div className="py-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-xs text-slate-400">Fetching user account information...</p>
              </div>
            ) : selectedUser ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-4 items-center bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-650 font-bold border">
                      {selectedUser.name?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedUser.name}</h4>
                    <span className="inline-flex items-center gap-1 rounded bg-violet-50 text-violet-750 border border-violet-100 px-1.5 py-0.5 mt-1">
                      {selectedUser.role?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 pt-2 text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Email Address</span>
                    <span className="text-slate-800">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Phone Number</span>
                    <span className="text-slate-800">{selectedUser.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Account Status</span>
                    <span className={selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Registration Date</span>
                    <span className="text-slate-800">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedUser.email !== currentUser?.email && selectedUser._id !== currentUser?._id && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                    {selectedUser.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleMakeAdmin(selectedUser._id)}
                        className="flex-1 rounded-xl bg-violet-650 hover:bg-violet-700 text-white py-2.5 text-xs font-black uppercase transition cursor-pointer"
                      >
                        Make Admin
                      </button>
                    )}
                    {selectedUser.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => handleMakeOwner(selectedUser._id)}
                        className="flex-1 rounded-xl bg-sky-650 hover:bg-sky-700 text-white py-2.5 text-xs font-black uppercase transition cursor-pointer"
                      >
                        Make Owner
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => { setCreateModalOpen(false); setNewUserData({ name: '', email: '', password: '', role: 'admin', phoneNumber: '' }); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="text-violet-650" size={20} /> Create New Account
              </h3>
              <p className="text-xs text-slate-500">Add a new admin, owner, or user account directly</p>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Platform Admin John"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. admin@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={newUserData.phoneNumber}
                  onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                  placeholder="e.g. +8801700000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="user">User</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingUser}
                className="w-full py-3 mt-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
              >
                {creatingUser ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                {creatingUser ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
