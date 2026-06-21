import { useEffect, useState, useCallback } from 'react';
import { Calendar, RefreshCw, AlertCircle, Landmark, TrendingUp } from 'lucide-react';
import TakaSign from '../../../components/TakaSign';
import { getPayments } from '../../../services/paymentsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const methodLabels = {
  cash: 'Cash',
  card: 'Card',
  mobile_banking: 'Mobile Banking',
  bank_transfer: 'Bank Transfer',
};

const statusConfig = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  failed: 'bg-rose-50 text-rose-700 border-rose-100',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
};

const OwnerPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await getPayments(params);
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      // Owner sees payments where they are the payee
      setPayments(list);
      if (res.data?.meta) setMeta(res.data.meta);

      const completedEarnings = list
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalEarnings(completedEarnings);
    } catch (err) {
      setError('Failed to load payment history.');
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Earnings & Payments</h2>
        <p className="text-sm text-slate-500 mt-1">Review your payout transactions and booking payment history.</p>
      </div>

      {/* Revenue summary */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xs">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Earnings (this page)</span>
              <div className="text-xl font-bold text-slate-900">
                ৳{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xs">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <TakaSign size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total Transactions</span>
              <div className="text-xl font-bold text-slate-900">{meta.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-semibold">
          {['', 'completed', 'pending', 'refunded'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 capitalize transition cursor-pointer border-r border-slate-200 last:border-0 ${statusFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchPayments}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} />
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
                <th className="p-4 pl-6">Reference</th>
                <th className="p-4">Renter</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-3 bg-slate-200 rounded w-32" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="p-4"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="p-4 pr-6"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Landmark size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No payments found.</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 pl-6 font-mono text-xs text-violet-600 font-semibold">
                      {payment.paymentReference}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-xs">{payment.payerId?.name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{payment.payerId?.email || ''}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Landmark size={12} className="text-slate-400" />
                        {methodLabels[payment.method] || payment.method}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ৳{payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${statusConfig[payment.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} · {meta.total} transactions
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
    </div>
  );
};

export default OwnerPayments;
