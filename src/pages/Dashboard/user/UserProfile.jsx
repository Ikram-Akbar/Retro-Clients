import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { updateProfile, changePassword, updatePhoneNumber, uploadAvatar } from '../../../services/authService';
import { User, Mail, Shield, Save, Key } from 'lucide-react';
import useToast from '../../../hooks/useToast';

const UserProfile = () => {
  const { user, fetchCurrentUser } = useAuth();
  const toast = useToast();
  
  // Profile settings state
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(user?.phoneNumber || user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const name = `${firstName} ${lastName}`.trim();
      await updateProfile({ name });
      
      if (phone !== (user?.phoneNumber || user?.phone || '')) {
        await updatePhoneNumber({ phoneNumber: phone });
      }

      toast.success('Profile updated successfully!');
      await fetchCurrentUser();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setProfileSaving(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await uploadAvatar(formData);
      toast.success('Avatar uploaded successfully!');
      await fetchCurrentUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.warning('Please fill out all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      toast.warning('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Confirm password does not match.');
      return;
    }
    try {
      setPasswordSaving(true);
      await changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account identity details and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Settings Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 pb-6">
              <div className="relative group">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-violet-100" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 text-2xl font-bold ring-2 ring-violet-100">
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/45 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer select-none">
                  <span>Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-0.5 text-xs font-semibold mt-2.5">
                  <Shield size={12} />
                  {user?.role || 'USER'} Account
                </span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed border-dashed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Registered account email cannot be changed.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Save size={16} />
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security / Password Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handlePasswordSave} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Update Password</h3>
              <p className="text-xs text-slate-500">Change your password credentials securely.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  placeholder="Enter new password (min. 8 chars)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Key size={16} />
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
