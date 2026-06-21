import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import * as authService from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    if (!token) return setError('Reset token is required');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Reset password</h1>
            <p className="mt-2 text-sm text-slate-600">Provide a new password using the reset token.</p>
          </div>

          {message && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Reset token</label>
                <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950" />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950" />
            </div>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
              {loading ? 'Resetting...' : 'Reset password'}
            </button>

            <div className="text-center text-sm text-slate-600">
              <button type="button" onClick={() => navigate('/login')} className="text-indigo-700 font-semibold">Back to login</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
