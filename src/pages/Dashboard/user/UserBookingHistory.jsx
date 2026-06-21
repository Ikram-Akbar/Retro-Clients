import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { getBookings, getBookingHistory } from '../../../services/bookingsService';
import { unwrapPayload } from '../../../api/tokenUtils';

const UserBookingHistory = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const handleViewHistoryLog = async (id) => {
    try {
      setLoadingHistory(true);
      setHistoryModalOpen(true);
      const res = await getBookingHistory(id);
      setSelectedHistory(unwrapPayload(res.data) || []);
    } catch (err) {
      console.error('Failed to fetch booking history log:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getBookings();
        const payload = unwrapPayload(res.data);
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        // Show completed, cancelled, or rejected bookings in history
        const history = list.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected');
        setBookings(history);
      } catch (err) {
        console.error('Failed to load booking history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Booking History</h2>
        <p className="text-sm text-slate-500 mt-1">Review detail logs of your completed vehicle rentals.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">Vehicle</th>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Rental Period</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {bookings.map((booking) => {
                  const vehicle = booking.vehicleId || {};
                  const vehicleImage = vehicle.images?.[0]?.url || 'https://images.unsplash.com/photo-1611245801047-ae83f88a855d?auto=format&fit=crop&q=80&w=200';
                  
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-16 overflow-hidden rounded-lg bg-slate-100 shrink-0">
                            <img src={vehicleImage} alt={vehicle.name || 'Vehicle'} className="h-full w-full object-cover" />
                          </div>
                          <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                            {vehicle.brand} {vehicle.name || 'Deleted Vehicle'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-violet-600 font-semibold">{booking._id?.slice(-6).toUpperCase()}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">৳{booking.totalAmount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          booking.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {booking.status === 'completed' ? (
                            <CheckCircle size={12} className="text-emerald-600" />
                          ) : (
                            <XCircle size={12} className="text-rose-600" />
                          )}
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            type="button"
                            onClick={() => handleViewHistoryLog(booking._id)}
                            className="text-xs font-bold text-slate-500 hover:text-violet-650 transition cursor-pointer"
                          >
                            View Log
                          </button>
                          {booking.status === 'completed' ? (
                            <button type="button" className="text-xs font-bold text-violet-600 hover:text-violet-700 transition cursor-pointer">
                              Download receipt
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">N/A</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No booking history logs found.
          </div>
        )}
      </div>

      {/* History Log Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <button
              onClick={() => { setHistoryModalOpen(false); setSelectedHistory(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="text-violet-650" size={20} /> Booking Lifecycle Logs
              </h3>
              <p className="text-xs text-slate-500">Chronological history of state transitions for this booking</p>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-xs text-slate-400">Loading lifecycle logs...</p>
              </div>
            ) : selectedHistory && selectedHistory.length > 0 ? (
              <div className="flow-root max-h-[300px] overflow-y-auto pr-2 mt-4">
                <ul className="-mb-8">
                  {selectedHistory.map((log, logIdx) => (
                    <li key={log._id || logIdx}>
                      <div className="relative pb-8">
                        {logIdx !== selectedHistory.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border">
                              {logIdx + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs text-slate-800 font-bold uppercase">
                                Transitioned to <span className="text-violet-600">{log.newStatus}</span>
                              </p>
                              {log.reason && (
                                <p className="text-xs text-slate-400 italic mt-0.5">Reason: {log.reason}</p>
                              )}
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-slate-450 font-semibold">
                              {new Date(log.changedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No status transition logs recorded for this booking.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookingHistory;
