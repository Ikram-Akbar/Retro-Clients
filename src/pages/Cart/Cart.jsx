import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useCart from '../../hooks/useCart';
import useToast from '../../hooks/useToast';
import { X, Tag, RefreshCw, ShoppingCart, Calendar, MapPin, Inbox, Info } from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    lastRemoved, 
    undoRemove, 
    coupon, 
    discount, 
    applyCoupon, 
    removeCoupon, 
    getCartTotals 
  } = useCart();
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const [couponInput, setCouponInput] = useState('');
  
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) {
      toast.error('Please enter a coupon code.');
      return;
    }
    applyCoupon(couponInput);
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    navigate('/checkout');
  };

  const totals = getCartTotals();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Page Title Header */}
      <section className="bg-[#111113] text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white">Cart</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-amber-500">Home</Link> / <span className="text-amber-500">Cart</span>
          </p>
        </div>
      </section>

      {/* Main Cart Area */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
        
        {/* Undo Remove Banner - Matches Image 1 Alert Box */}
        {lastRemoved && (
          <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-sm font-semibold shadow-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Info size={16} className="text-blue-500" />
              <span>"{lastRemoved.vehicle.title || lastRemoved.vehicle.name}" removed.</span>
            </div>
            <button 
              onClick={undoRemove} 
              className="text-amber-500 hover:text-amber-600 font-extrabold uppercase cursor-pointer hover:underline"
            >
              Undo?
            </button>
          </div>
        )}

        {cart.length === 0 ? (
          /* Empty Cart View */
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs flex flex-col items-center max-w-xl mx-auto space-y-6">
            <span className="p-5 rounded-full bg-slate-50 text-slate-400">
              <Inbox size={48} className="stroke-[1.5]" />
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 uppercase">Your Cart is Empty</h2>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">You haven't added any rental listings to your checkout queue yet.</p>
            </div>
            <Link 
              to="/browse-rental" 
              className="px-6 py-3.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer"
            >
              Browse Rentals
            </Link>
          </div>
        ) : (
          /* Cart items & totals grid */
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr] items-start">
            
            {/* Left Column: Table List */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Table Header */}
                  <thead className="bg-slate-50 border-b border-slate-250/30">
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="py-4.5 px-6">Product</th>
                      <th className="py-4.5 px-4 text-center">Price</th>
                      <th className="py-4.5 px-4 text-center">Quantity</th>
                      <th className="py-4.5 px-6 text-right">Total</th>
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody>
                    {cart.map((item) => {
                      const image = item.vehicle.images?.[0]?.url || item.vehicle.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200';
                      const name = item.vehicle.title || item.vehicle.name;
                      
                      // Format dates for display
                      const startFmt = new Date(item.startDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                      const endFmt = new Date(item.endDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/20 transition-all">
                          {/* Product Info with details */}
                          <td className="py-6 px-6">
                            <div className="flex items-start gap-4">
                              {/* Close Trigger */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="mt-2 text-rose-500 hover:text-rose-700 hover:scale-110 transition cursor-pointer"
                                aria-label="Remove item"
                              >
                                <X size={16} className="stroke-[2.5]" />
                              </button>

                              {/* Thumbnail */}
                              <img
                                src={image}
                                alt={name}
                                className="h-16 w-24 rounded-xl object-cover border border-slate-200"
                              />

                              {/* Rental specifications breakdown */}
                              <div className="space-y-2">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide leading-none">{name}</h3>
                                
                                <div className="space-y-1 text-[11px] text-slate-500 font-semibold leading-tight">
                                  <p className="flex items-center gap-1.5 uppercase text-[9px] font-black text-slate-400">
                                    <Calendar size={11} />
                                    Rental Period
                                  </p>
                                  <p className="pl-4">From: {startFmt}</p>
                                  <p className="pl-4">To: {endFmt}</p>
                                  
                                  <p className="flex items-center gap-1.5 uppercase text-[9px] font-black text-slate-400 mt-1.5">
                                    <MapPin size={11} />
                                    Locations
                                  </p>
                                  <p className="pl-4">Pickup: {item.pickupLocation}</p>
                                  <p className="pl-4">Dropoff: {item.dropoffLocation}</p>
                                </div>

                                {/* Mini breakdown */}
                                <div className="mt-3.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-500 font-semibold">
                                  <p className="font-extrabold text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Pricing Breakdown</p>
                                  
                                  <div className="flex justify-between">
                                    <span>Base Rental: ৳{item.breakdown.baseRental.rate.toFixed(2)} × {item.breakdown.baseRental.days} days</span>
                                    <span>৳{item.breakdown.baseRental.total.toFixed(2)}</span>
                                  </div>

                                  {item.breakdown.childSafetySeats.selected && (
                                    <div className="flex justify-between">
                                      <span>Child Safety Seats (one-time)</span>
                                      <span>৳10.00</span>
                                    </div>
                                  )}

                                  {item.breakdown.wifiHotspot.selected && (
                                    <div className="flex justify-between">
                                      <span>wi-fi-hotspot: ৳10.00 × {item.breakdown.wifiHotspot.days} days</span>
                                      <span>৳{item.breakdown.wifiHotspot.total.toFixed(2)}</span>
                                    </div>
                                  )}

                                  {item.breakdown.navigation.selected && (
                                    <div className="flex justify-between">
                                      <span>navigation (one-time)</span>
                                      <span>৳10.00</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between">
                                    <span>Relocation Fee</span>
                                    <span>৳60.00</span>
                                  </div>

                                  <div className="flex justify-between text-slate-400">
                                    <span>Deposit: ৳{item.breakdown.subtotal.toFixed(2)} × 50%</span>
                                    <span>৳{item.breakdown.deposit.toFixed(2)}</span>
                                  </div>

                                  <div className="flex justify-between font-black text-slate-800 border-t border-dashed border-slate-200/60 pt-2 text-xs">
                                    <span>Total</span>
                                    <span className="text-amber-500">৳{item.breakdown.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Unit Subtotal */}
                          <td className="py-6 px-4 text-center font-extrabold text-slate-800 text-sm">
                            ৳{item.breakdown.total.toFixed(2)}
                          </td>
                          
                          {/* Days Duration */}
                          <td className="py-6 px-4 text-center font-bold text-slate-500 text-xs uppercase">
                            {item.breakdown.baseRental.days} Days
                          </td>
                          
                          {/* Final row total */}
                          <td className="py-6 px-6 text-right font-extrabold text-slate-900 text-sm">
                            ৳{item.breakdown.total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Coupon code & update button bar */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!coupon}
                    className="px-4.5 py-3 border border-slate-200 text-xs font-bold uppercase rounded-xl outline-none focus:border-amber-500 placeholder:text-slate-400 bg-white disabled:opacity-50"
                  />
                  {coupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="px-5 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-extrabold uppercase transition cursor-pointer"
                    >
                      Remove Coupon
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase rounded-xl transition shadow-xs cursor-pointer"
                    >
                      Apply Coupon
                    </button>
                  )}
                </form>

                <button
                  type="button"
                  onClick={() => toast.success('Cart data refreshed.')}
                  className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-extrabold uppercase rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} className="stroke-[2.5]" />
                  Update Cart
                </button>
              </div>
            </div>

            {/* Right Column: Cart Totals card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl p-6 space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">Cart Totals</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-800">৳{totals.subtotal.toFixed(2)}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-rose-600 font-bold bg-rose-50 px-3 py-2 rounded-xl">
                    <span>Discount ({discount}%)</span>
                    <span>-৳{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-100 pt-4">
                  <span>Total</span>
                  <span className="text-amber-500">৳{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-4.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <ShoppingCart size={16} />
                Proceed To Checkout
              </button>
            </div>

          </div>
        )}

      </section>

    </main>
  );
};

export default Cart;
