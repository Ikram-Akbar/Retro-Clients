import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as authService from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authService.forgotPassword(email);
      const payload = res?.data ?? res;
      setMessage(payload?.message || 'If an account exists, a reset token was issued.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Forgot your password?</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your email to receive a password reset link or token.</p>
          </div>

          {message && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                {loading ? 'Sending...' : 'Send reset token'}
              </button>
            </div>

            <div className="text-center text-sm text-slate-600">
              <button type="button" onClick={() => navigate('/login')} className="text-indigo-700 font-semibold">Back to login</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
