import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { createBooking } from '../../services/bookingsService';
import { CreditCard, Landmark, CheckSquare, Truck, HelpCircle } from 'lucide-react';

const Checkout = () => {
  const { cart, getCartTotals, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to proceed to checkout.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cart.length === 0 && !bookingSuccess) {
      navigate('/cart');
    }
  }, [cart, user, navigate, toast, bookingSuccess]);

  const totals = getCartTotals();

  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    phone: '',
    email: user?.email || '',
    notes: ''
  });

  // Sync user email when user data loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.state || !formData.postcode || !formData.phone || !formData.email) {
      toast.error('Please fill out all required fields.');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!user) {
      toast.error('Please log in to proceed to checkout.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setIsSubmitting(true);
    const rental = cart[0]; // Get the single cart item

    // Generate random 4-digit order number
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
    // Save billing data in session/localStorage so the thank you page can show it
    const receiptData = {
      orderNumber,
      date: new Date().toLocaleDateString(),
      email: formData.email,
      paymentMethod: paymentMethod === 'bank_transfer' ? 'Direct bank transfer' :
                     paymentMethod === 'check' ? 'Check payments' :
                     paymentMethod === 'cod' ? 'Cash on delivery' : 'PayPal',
      billingName: `${formData.firstName} ${formData.lastName}`,
      vehicle: rental.vehicle,
      startDate: rental.startDate,
      endDate: rental.endDate,
      pickupLocation: rental.pickupLocation,
      dropoffLocation: rental.dropoffLocation,
      breakdown: rental.breakdown,
      totals
    };

    sessionStorage.setItem('rentro_latest_receipt', JSON.stringify(receiptData));

    try {
      // Register the booking in the backend database
      await createBooking({
        vehicleId: rental.vehicle._id || rental.vehicle.id,
        startDate: rental.startDate,
        endDate: rental.endDate,
        notes: JSON.stringify({
          billingDetails: formData,
          paymentMethod,
          orderNumber
        })
      });
      toast.success('Booking requested successfully!');
      
      // Redirect only on success — the cart will be cleared on the Thank You page
      setBookingSuccess(true);
      navigate('/checkout/thank-you');
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      console.error('Failed to submit booking:', err);
      toast.error(serverMsg);
      // Do NOT clear cart or redirect — let the user retry
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) return null;
  const rental = cart[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Page Title */}
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

      {/* Checkout Form Area */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
        <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr] items-start">
          
          {/* Left Panel: Billing Info */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 md:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">Billing details</h3>
                       <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">First name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Last name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Company name (optional)</label>
              <input
                type="text"
                name="companyName"
                placeholder="Company name"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Country / Region <span className="text-rose-500">*</span></label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="" disabled>Select country / region</option>
                <option value="Dominica">Dominica</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Street address <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="address1"
                placeholder="House number and street name"
                value={formData.address1}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="address2"
                placeholder="Apartment, suite, unit, etc. (optional)"
                value={formData.address2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Town / City <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="city"
                placeholder="Town / City"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">State / County <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="state"
                placeholder="State / County"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Postcode / ZIP <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="postcode"
                placeholder="Postcode / ZIP"
                value={formData.postcode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Phone <span className="text-rose-500">*</span></label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Email address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                readOnly
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold rounded-xl outline-none cursor-not-allowed"
              />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide border-t border-slate-100 pt-6">Additional information</h3>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Order notes (optional)</label>
              <textarea
                name="notes"
                rows="4"
                placeholder="Notes about your order, e.g. special notes for delivery."
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-amber-500 resize-y"
              />
            </div>
          </div>

          {/* Right Panel: Order Summary & Payments */}
          <div className="space-y-6">
            
            {/* Your Order summary */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xl space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">Your order</h3>
              
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>

                <div className="space-y-1">
                  <p className="font-extrabold text-slate-800 uppercase tracking-wide">{rental.vehicle.title || rental.vehicle.name}</p>
                  <p className="text-[10px] text-slate-450 font-bold uppercase leading-relaxed">
                    Rental Period:<br />
                    {new Date(rental.startDate).toLocaleDateString()} {new Date(rental.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -<br />
                    {new Date(rental.endDate).toLocaleDateString()} {new Date(rental.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-[10px] text-slate-450 font-bold uppercase">
                    Pickup: {rental.pickupLocation}
                  </p>
                  <p className="text-[10px] text-slate-450 font-bold uppercase">
                    Dropoff: {rental.dropoffLocation}
                  </p>
                  <p className="text-[11px] font-extrabold text-slate-500 mt-1">× 1</p>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-800">৳{totals.subtotal.toFixed(2)}</span>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Discount</span>
                    <span>-৳{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-100 pt-3">
                  <span>Total</span>
                  <span className="text-amber-500">৳{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Options card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-xl space-y-5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">Payment Method</h4>
              
              <div className="space-y-4">
                {/* Method A: Bank Transfer */}
                <label className="block space-y-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="radio radio-xs radio-warning"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                      <Landmark size={13} className="text-slate-500" />
                      Direct bank transfer
                    </span>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                    </div>
                  )}
                </label>

                {/* Method B: Check */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="check"
                    checked={paymentMethod === 'check'}
                    onChange={() => setPaymentMethod('check')}
                    className="radio radio-xs radio-warning"
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <CheckSquare size={13} className="text-slate-500" />
                    Check payments
                  </span>
                </label>

                {/* Method C: Cash on delivery */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="radio radio-xs radio-warning"
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Truck size={13} className="text-slate-500" />
                    Cash on delivery
                  </span>
                </label>

                {/* Method D: PayPal */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="radio radio-xs radio-warning"
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    PayPal
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 ml-1 inline-block" />
                  </span>
                </label>
              </div>

              {/* Terms Checkbox & Policy */}
              <div className="text-[11px] text-slate-500 leading-relaxed font-semibold border-t border-slate-100 pt-4 space-y-4">
                <p>
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <Link to="/about" className="text-amber-500 font-bold hover:underline">privacy policy</Link>.
                </p>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition duration-300 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : 'Place Order'}
                </button>
              </div>
            </div>

          </div>

        </form>
      </section>

    </main>
  );
};

export default Checkout;
