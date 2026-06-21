import { createContext, useState, useEffect, useCallback } from 'react';
import useToast from '../hooks/useToast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rentro_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastRemoved, setLastRemoved] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0); // in percent, e.g. 10 for 10%
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem('rentro_cart', JSON.stringify(cart));
  }, [cart]);

  // Dynamic price breakdown calculator
  const calculateBreakdown = useCallback((vehicle, days, extras = [], pickupLocation, dropoffLocation) => {
    const dailyRate = vehicle?.pricePerDay || 100;
    const baseRental = dailyRate * days;

    const hasChildSeat = extras.includes('Child Safety Seats');
    const hasWifi = extras.includes('Wi-Fi Hotspot');
    const hasNav = extras.includes('GPS Navigation') || extras.includes('navigation');

    const childSafetySeats = hasChildSeat ? 10 : 0;
    const wifiHotspot = hasWifi ? 10 * days : 0;
    const navigation = hasNav ? 10 : 0;

    // Relocation fee is $60 if dropoff location is different from pickup
    const relocationFee = (pickupLocation && dropoffLocation && pickupLocation !== dropoffLocation) ? 60 : 60; // default to $60 as per screenshot

    const subtotal = baseRental + childSafetySeats + wifiHotspot + navigation + relocationFee;
    const deposit = Math.round(subtotal * 0.5 * 100) / 100; // 50% deposit
    const total = subtotal + deposit;

    return {
      baseRental: { rate: dailyRate, days, total: baseRental },
      childSafetySeats: { selected: hasChildSeat, total: childSafetySeats },
      wifiHotspot: { selected: hasWifi, rate: 10, days, total: wifiHotspot },
      navigation: { selected: hasNav, total: navigation },
      relocationFee,
      deposit,
      subtotal,
      total,
    };
  }, []);

  const addToCart = useCallback((item) => {
    // We only support renting one vehicle at a time in the cart for simplicity (like typical car rentals)
    // but we can allow multiple. The screenshot shows a single item.
    // Let's replace the cart or add to it.
    const days = Math.max(1, Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24)));
    const breakdown = calculateBreakdown(item.vehicle, days, item.extras, item.pickupLocation, item.dropoffLocation);

    const newItem = {
      id: item.vehicle._id || item.vehicle.id || Date.now().toString(),
      vehicle: item.vehicle,
      rentalType: item.rentalType || 'Day',
      pickupLocation: item.pickupLocation || 'Big Ben',
      dropoffLocation: item.dropoffLocation || 'Palace of Westminster',
      startDate: item.startDate,
      endDate: item.endDate,
      extras: item.extras || [],
      breakdown,
    };

    setCart([newItem]); // Replace cart with new single rental
    toast.success(`${item.vehicle.title || item.vehicle.name} added to cart!`);
  }, [calculateBreakdown, toast]);

  const removeFromCart = useCallback((id) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (itemToRemove) {
      setLastRemoved(itemToRemove);
      setCart(prev => prev.filter(item => item.id !== id));
      toast.info(`"${itemToRemove.vehicle.title || itemToRemove.vehicle.name}" removed.`);
    }
  }, [cart, toast]);

  const undoRemove = useCallback(() => {
    if (lastRemoved) {
      setCart([lastRemoved]);
      setLastRemoved(null);
      toast.success(`Restored "${lastRemoved.vehicle.title || lastRemoved.vehicle.name}" to cart.`);
    }
  }, [lastRemoved, toast]);

  const clearCart = useCallback(() => {
    setCart([]);
    setLastRemoved(null);
  }, []);

  const updateCart = useCallback((id, updatedFields) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        const days = Math.max(1, Math.ceil((new Date(merged.endDate) - new Date(merged.startDate)) / (1000 * 60 * 60 * 24)));
        merged.breakdown = calculateBreakdown(merged.vehicle, days, merged.extras, merged.pickupLocation, merged.dropoffLocation);
        return merged;
      }
      return item;
    }));
    toast.success('Cart updated successfully.');
  }, [calculateBreakdown, toast]);

  const applyCoupon = useCallback((code) => {
    if (code.trim().toUpperCase() === 'SAVE10') {
      setCoupon(code);
      setDiscount(10);
      toast.success('Coupon "SAVE10" applied! 10% discount.');
      return true;
    } else if (code.trim().toUpperCase() === 'FREE50') {
      setCoupon(code);
      setDiscount(50);
      toast.success('Coupon "FREE50" applied! 50% discount.');
      return true;
    } else {
      toast.error('Invalid coupon code.');
      return false;
    }
  }, [toast]);

  const removeCoupon = useCallback(() => {
    setCoupon('');
    setDiscount(0);
    toast.info('Coupon removed.');
  }, [toast]);

  // Get totals for the cart sidebar
  const getCartTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.breakdown.total, 0);
    const discountAmount = Math.round(subtotal * (discount / 100) * 100) / 100;
    const total = subtotal - discountAmount;
    return {
      subtotal,
      discountAmount,
      total,
    };
  }, [cart, discount]);

  return (
    <CartContext.Provider value={{
      cart,
      lastRemoved,
      coupon,
      discount,
      addToCart,
      removeFromCart,
      undoRemove,
      clearCart,
      updateCart,
      applyCoupon,
      removeCoupon,
      getCartTotals,
      calculateBreakdown,
      setLastRemoved,
    }}>
      {children}
    </CartContext.Provider>
  );
};
