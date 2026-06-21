import { useEffect, useState, useCallback } from 'react';
import { Calendar, Tag, CreditCard, ShieldCheck, X } from 'lucide-react';
import TakaSign from '../../../components/TakaSign';
import { getBookings, cancelBooking } from '../../../services/bookingsService';
import { createPayment, verifyMockPayment } from '../../../services/paymentsService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';
import useConfirm from '../../../hooks/useConfirm';
import { useSearchParams } from 'react-router';

const UserBookings = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // Mock card states
  const [mockPaymentRef, setMockPaymentRef] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState('front'); // 'front' | 'back'
  const [isSubmittingMock, setIsSubmittingMock] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBookings();
      const payload = unwrapPayload(res.data);
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      // Show pending and approved bookings in active listings
      const active = list.filter(b => b.status === 'pending' || b.status === 'approved');
      setBookings(active);
    } catch (err) {
      console.error('Failed to load active bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const success = searchParams.get('payment_success');
    const cancelled = searchParams.get('payment_cancelled');
    const mockCheckout = searchParams.get('mockCheckout');
    const ref = searchParams.get('ref');

    if (success === 'true') {
      toast.success('Payment completed successfully! Your rental is locked in.');
      searchParams.delete('payment_success');
      searchParams.delete('ref');
      setSearchParams(searchParams);
      fetchBookings();
    } else if (cancelled === 'true') {
      toast.warning('Payment session was cancelled.');
      searchParams.delete('payment_cancelled');
      searchParams.delete('ref');
      setSearchParams(searchParams);
    } else if (mockCheckout === 'true' && ref) {
      setMockPaymentRef(ref);
      // Clean query params so refresh doesn't trigger modal indefinitely
      searchParams.delete('mockCheckout');
      searchParams.delete('ref');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, fetchBookings, toast]);

  const handleCancelBooking = async (id) => {
    const confirmed = await confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This will free up the vehicle for other renters.',
      confirmText: 'Yes, cancel booking',
      cancelText: 'Keep booking',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      setCancellingId(id);
      await cancelBooking(id);
      toast.success('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to cancel booking';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayBooking = async (id) => {
    try {
      setPayingId(id);
      const res = await createPayment({ bookingId: id });
      const payload = res.data?.data;
      if (payload?.sessionUrl) {
        window.location.href = payload.sessionUrl;
      } else {
        toast.error('Failed to initialize payment session.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment initialization failed.');
    } finally {
      setPayingId(null);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(value);
  };

  const handleMockPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
      toast.error('Please fill in all credit card details correctly.');
      return;
    }

    try {
      setIsSubmittingMock(true);
      await verifyMockPayment(mockPaymentRef);
      toast.success('Mock payment completed successfully! Reference registered.');
      setMockPaymentRef(null);
      // Reset form
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Mock payment verification failed.');
    } finally {
      setIsSubmittingMock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading active bookings...</p>
        </div>
      </div>
    );
  }

  // Get active booking detail for current mock payment modal
  const activePaymentBooking = bookings.find(b => b.payment?.paymentReference === mockPaymentRef);

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Active Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your active, upcoming, and unpaid vehicle reservations.</p>
      </div>

      {bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const vehicle = booking.vehicleId || {};
            const vehicleImage = vehicle.images?.[0]?.url || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600';
            const isPaid = booking.payment?.status === 'completed';

            return (
              <div key={booking._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="h-44 relative bg-slate-100">
                  <img src={vehicleImage} alt={vehicle.name || 'Vehicle'} className="h-full w-full object-cover" />
                  <span className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold border capitalize shadow-sm transition ${
                    booking.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : isPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-violet-50 text-violet-700 border-violet-200'
                  }`}>
                    {booking.status === 'pending' ? 'Pending Approval ⏳' : isPaid ? 'Approved & Paid ✓' : 'Approved (Unpaid)'}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-xs text-violet-600 font-bold tracking-wider uppercase">Booking ID: {booking._id?.slice(-6).toUpperCase()}</div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {vehicle.brand} {vehicle.model || vehicle.name || 'Vehicle Rental'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily Rate: ৳{booking.dailyRateSnapshot}/day</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Start Date</span>
                      <span className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                        <Calendar size={13} className="text-violet-600" />
                        {new Date(booking.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">End Date</span>
                      <span className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                        <Calendar size={13} className="text-violet-600" />
                        {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Total Amount</span>
                      <span className="flex items-center text-lg font-bold text-slate-900 mt-0.5">
                        <TakaSign size={16} className="text-slate-400" />
                        {booking.totalAmount}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2.5 py-2 rounded-xl flex items-center gap-1">
                          Awaiting Approval
                        </span>
                      )}
                      {booking.status === 'approved' && !isPaid && (
                        <button
                          type="button"
                          disabled={payingId === booking._id}
                          onClick={() => handlePayBooking(booking._id)}
                          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {payingId === booking._id ? (
                            <span className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin mr-1" />
                          ) : null}
                          Pay Now
                        </button>
                      )}
                      {!isPaid && (
                        <button
                          type="button"
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancelBooking(booking._id)}
                          className="rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3.5 py-2 text-xs font-semibold text-rose-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === booking._id ? '...' : 'Cancel'}
                        </button>
                      )}
                      {isPaid && (
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-2xs">
                          <ShieldCheck size={14} className="text-emerald-600" /> Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Tag size={20} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">No active bookings</h3>
          <p className="mt-2 text-xs text-slate-500">You do not have any vehicle bookings scheduled right now.</p>
        </div>
      )}

      {/* Premium Glassmorphic Mock Credit Card Checkout Modal */}
      {mockPaymentRef && activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-md space-y-6">
            <button
              onClick={() => setMockPaymentRef(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                <CreditCard className="text-violet-600" /> Rentro Checkout
              </h3>
              <p className="text-xs text-slate-500">Simulate credit card payments locally for testing</p>
            </div>

            {/* Interactive Credit Card Visualization */}
            <div className="perspective-1000 w-full max-w-xs mx-auto h-48 relative">
              <div
                className={`relative w-full h-full duration-700 transform-style-3d rounded-2xl shadow-xl transition-transform ${
                  cardFocused === 'back' ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 p-5 flex flex-col justify-between text-white border border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-violet-200">Payment Gateway</p>
                      <h4 className="text-md font-bold tracking-wide mt-0.5">Rentro Pay</h4>
                    </div>
                    {/* Simulated Chip */}
                    <div className="h-7 w-9 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner" />
                  </div>

                  <div>
                    <p className="font-mono text-lg tracking-widest text-center sm:text-left select-none">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <div>
                      <span className="block text-violet-200 uppercase tracking-widest text-[8px]">Cardholder</span>
                      <span className="font-semibold tracking-wide uppercase truncate max-w-[150px] block mt-0.5">
                        {cardName || 'YOUR FULL NAME'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-violet-200 uppercase tracking-widest text-[8px]">Expires</span>
                      <span className="font-semibold block mt-0.5">{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 py-5 flex flex-col justify-between text-white border border-white/10">
                  <div className="w-full h-10 bg-slate-800 mt-2" />
                  
                  <div className="px-5">
                    <div className="flex items-center justify-end">
                      <div className="bg-white text-slate-800 text-[10px] font-bold px-2 py-1.5 rounded-l text-right w-24 tracking-widest italic select-none">
                        XXX
                      </div>
                      <div className="bg-slate-300 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-r">
                        {cardCvv || '•••'}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-widest">
                    <span>Authorized Signature</span>
                    <span className="text-[10px] font-bold text-white">Rentro Inc.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleMockPaymentSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 mb-2 text-xs">
                <div>
                  <span className="block text-slate-400 uppercase tracking-wider text-[9px]">Vehicle</span>
                  <span className="font-bold text-slate-800 block mt-0.5 truncate">
                    {activePaymentBooking.vehicleId?.brand} {activePaymentBooking.vehicleId?.model || activePaymentBooking.vehicleId?.name}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase tracking-wider text-[9px]">Total Amount</span>
                  <span className="font-bold text-violet-700 block mt-0.5 text-sm">
                    ৳{activePaymentBooking.totalAmount}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onFocus={() => setCardFocused('front')}
                  className="input input-bordered w-full text-xs font-semibold focus:outline-none border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => setCardFocused('front')}
                  className="input input-bordered w-full font-mono text-xs focus:outline-none border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setCardFocused('front')}
                    className="input input-bordered w-full text-xs focus:outline-none border-slate-200 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CVV</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    onFocus={() => setCardFocused('back')}
                    onBlur={() => setCardFocused('front')}
                    className="input input-bordered w-full text-xs focus:outline-none border-slate-200 text-center font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingMock}
                className="w-full rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md mt-2 flex items-center justify-center gap-1.5"
              >
                {isSubmittingMock ? (
                  <span className="h-4 w-4 rounded-full border border-white border-t-transparent animate-spin" />
                ) : null}
                {isSubmittingMock ? 'Verifying payment...' : 'Simulate Successful Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
