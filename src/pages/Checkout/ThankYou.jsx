import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Calendar, ClipboardList, Mail, ArrowRight, Printer } from 'lucide-react';
import TakaSign from '../../components/TakaSign';
import useCart from '../../hooks/useCart';

const ThankYou = () => {
  const [receipt, setReceipt] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const data = sessionStorage.getItem('rentro_latest_receipt');
    if (data) {
      setReceipt(JSON.parse(data));
    }
    clearCart();
  }, [clearCart]);

  if (!receipt) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center py-20 text-center px-4">
        <h2 className="text-2xl font-black text-slate-900 uppercase">No Recent Order Found</h2>
        <p className="text-slate-500 text-sm mt-2">You haven't completed any bookings in this session.</p>
        <Link to="/" className="mt-6 inline-flex px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs">Go to Homepage</Link>
      </main>
    );
  }

  const startFmt = new Date(receipt.startDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const endFmt = new Date(receipt.endDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Page Header */}
      <section className="bg-[#111113] text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight">Checkout</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-amber-500">Home</Link> / <span className="text-amber-500">Checkout</span>
          </p>
        </div>
      </section>

      {/* Main Success Container */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:px-8 space-y-12">
        
        {/* Success Alert */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
            <CheckCircle2 size={44} className="stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase">Thank you.</h2>
            <p className="text-sm text-slate-550 font-bold">Your order has been received.</p>
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Order Number */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <ClipboardList size={22} className="stroke-[2.5]" />
            </span>
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Order Number</span>
              <span className="block text-base font-extrabold text-slate-800">{receipt.orderNumber}</span>
            </div>
          </div>

          {/* Card 2: Date */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Calendar size={22} className="stroke-[2.5]" />
            </span>
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Date</span>
              <span className="block text-base font-extrabold text-slate-800">{receipt.date}</span>
            </div>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Mail size={22} className="stroke-[2.5]" />
            </span>
            <div className="space-y-1 w-full overflow-hidden">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</span>
              <span className="block text-xs sm:text-sm font-extrabold text-slate-800 truncate" title={receipt.email}>{receipt.email}</span>
            </div>
          </div>

          {/* Card 4: Payment Method */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <TakaSign size={22} className="stroke-[2.5]" />
            </span>
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Payment Method</span>
              <span className="block text-xs font-extrabold text-slate-800 uppercase">{receipt.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Detailed Invoice Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Order Details</h3>
            <button 
              onClick={() => window.print()} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-500 hover:bg-slate-50 text-xs font-bold uppercase transition cursor-pointer"
            >
              <Printer size={12} />
              Print Receipt
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">{receipt.vehicle.title || receipt.vehicle.name}</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1 uppercase">Billing Name: {receipt.billingName}</p>
            </div>

            {/* Booking Details Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 text-xs font-semibold">
              <h5 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-2">Booking Details</h5>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Rental Period</span>
                  <p className="text-slate-700">From: {startFmt}</p>
                  <p className="text-slate-700">To: {endFmt}</p>
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Locations</span>
                  <p className="text-slate-700">Pickup Location: {receipt.pickupLocation}</p>
                  <p className="text-slate-700">Dropoff Location: {receipt.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Pricing Invoice Details */}
            <div className="space-y-3.5 text-xs font-semibold">
              <h5 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Pricing Breakdown</h5>

              <div className="flex justify-between text-slate-500">
                <span>Base Rental: ৳{receipt.breakdown.baseRental.rate.toFixed(2)} × {receipt.breakdown.baseRental.days} days</span>
                <span className="font-extrabold text-slate-800">৳{receipt.breakdown.baseRental.total.toFixed(2)}</span>
              </div>

              {receipt.breakdown.childSafetySeats.selected && (
                <div className="flex justify-between text-slate-500">
                  <span>Child Safety Seats (one-time)</span>
                  <span className="font-extrabold text-slate-800">৳10.00</span>
                </div>
              )}

              {receipt.breakdown.wifiHotspot.selected && (
                <div className="flex justify-between text-slate-500">
                  <span>wi-fi-hotspot: ৳10.00 × {receipt.breakdown.wifiHotspot.days} days</span>
                  <span className="font-extrabold text-slate-800">৳{receipt.breakdown.wifiHotspot.total.toFixed(2)}</span>
                </div>
              )}

              {receipt.breakdown.navigation.selected && (
                <div className="flex justify-between text-slate-500">
                  <span>navigation (one-time)</span>
                  <span className="font-extrabold text-slate-800">৳10.00</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Relocation Fee</span>
                <span className="font-extrabold text-slate-800">৳{receipt.breakdown.relocationFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-3.5">
                <span>Subtotal</span>
                <span className="font-extrabold text-slate-850">৳{receipt.breakdown.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Deposit (paid now): 50%</span>
                <span className="font-extrabold text-slate-800">৳{receipt.breakdown.deposit.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-450 border-b border-slate-150 pb-3.5">
                <span>Remaining Balance (due at pickup)</span>
                <span className="font-bold text-slate-700">৳{(receipt.breakdown.subtotal - receipt.breakdown.deposit).toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                <span>Total Amount</span>
                <span className="text-amber-500">৳{receipt.breakdown.total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Back Home Button */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link 
            to="/dashboard/renter/bookings" 
            className="inline-flex items-center justify-center gap-1.5 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm uppercase transition shadow-md cursor-pointer"
          >
            Go to My Bookings
            <ClipboardList size={14} className="stroke-[2.5]" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-1.5 px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm uppercase transition shadow-md cursor-pointer"
          >
            Back to homepage
            <ArrowRight size={14} className="stroke-[2.5]" />
          </Link>
        </div>

      </section>

    </main>
  );
};

export default ThankYou;
