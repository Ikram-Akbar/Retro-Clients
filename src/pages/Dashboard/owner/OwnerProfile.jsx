import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { User, Mail, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfile } from '../../../services/authService';

const OwnerProfile = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!name) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ name });
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Owner Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your owner account information and details.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 pb-6">
            <div className="h-20 w-20 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 text-2xl font-bold ring-2 ring-violet-100">
              {user?.name?.slice(0, 2).toUpperCase() || 'O'}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-0.5 text-xs font-semibold mt-2.5">
                <Shield size={12} />
                {user?.role?.toUpperCase() || 'OWNER'} Dashboard
              </span>
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                First Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  placeholder="First name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed border-dashed"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Email address cannot be changed.</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;
