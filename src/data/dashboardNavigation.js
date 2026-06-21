import {
  BarChart3,
  Bell,
  CalendarRange,
  CarFront,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  PlusCircle,
  Settings2,
  Star,
  UserPen,
  Users,
} from 'lucide-react';

export const dashboardNavigation = {
  USER: [
    { label: 'Dashboard', slug: '', icon: Home, description: 'Overview' },
    { label: 'My Bookings', slug: 'bookings', icon: CalendarRange, description: 'Current bookings' },
    { label: 'Booking History', slug: 'booking-history', icon: Clock3, description: 'Past activity' },
    { label: 'Wishlist', slug: 'wishlist', icon: Heart, description: 'Saved vehicles' },
    { label: 'Notifications', slug: 'notifications', icon: Bell, description: 'Alerts' },
    { label: 'Profile', slug: 'profile', icon: UserPen, description: 'Account info' },
  ],
  OWNER: [
    { label: 'Dashboard', slug: '', icon: Home, description: 'Overview' },
    { label: 'My Listings', slug: 'listings', icon: CarFront, description: 'Vehicles' },
    { label: 'Add Listing', slug: 'add-listing', icon: PlusCircle, description: 'Create vehicle' },
    { label: 'Booking Requests', slug: 'booking-requests', icon: ClipboardCheck, description: 'Pending requests' },
    { label: 'Payments', slug: 'payments', icon: CreditCard, description: 'Payment records' },
    { label: 'Reviews', slug: 'reviews', icon: Star, description: 'Owner reviews' },
    { label: 'Notifications', slug: 'notifications', icon: Bell, description: 'Alerts' },
    { label: 'Profile', slug: 'profile', icon: UserPen, description: 'Account info' },
  ],
  ADMIN: [
    { label: 'Dashboard', slug: '', icon: Home, description: 'Overview' },
    { label: 'Users', slug: 'users', icon: Users, description: 'Manage users' },
    { label: 'Rentals', slug: 'rentals', icon: CarFront, description: 'Vehicle moderation' },
    { label: 'Bookings', slug: 'bookings', icon: CalendarRange, description: 'Booking status' },
    { label: 'Payments', slug: 'payments', icon: CreditCard, description: 'Payment requests' },
    { label: 'Reviews', slug: 'reviews', icon: Star, description: 'Platform reviews' },
    { label: 'Reports', slug: 'reports', icon: BarChart3, description: 'Metrics' },
  ],
};

export const getDashboardNavigation = (role) => dashboardNavigation[String(role || 'USER').toUpperCase()] || dashboardNavigation.USER;
