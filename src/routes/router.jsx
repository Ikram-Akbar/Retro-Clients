import { createBrowserRouter, useLocation, Navigate } from "react-router";
import Main from "../layouts/Main.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import Home from "../pages/Home/Home.jsx";
import Cars from "../pages/Cars/Cars.jsx";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import ForgotPassword from "../pages/Auth/ForgotPassword.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";
import AboutUs from "../pages/AboutUs/AboutUs.jsx";
import Works from "../pages/HowItWorks/Works.jsx";
import BrowseRental from "../pages/BrowseRental/BrowseRental.jsx";
import CarDetails from "../pages/Cars/CarDetails.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Checkout from "../pages/Checkout/Checkout.jsx";
import ThankYou from "../pages/Checkout/ThankYou.jsx";

// Auth Route Guards & Layouts
import PrivateRoute from "./PrivateRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import DashboardRedirect from "./DashboardRedirect.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

// User Dashboard Views
import UserDashboard from "../pages/Dashboard/user/UserDashboard.jsx";
import UserBookings from "../pages/Dashboard/user/UserBookings.jsx";
import UserBookingHistory from "../pages/Dashboard/user/UserBookingHistory.jsx";
import UserWishlist from "../pages/Dashboard/user/UserWishlist.jsx";
import UserNotifications from "../pages/Dashboard/user/UserNotifications.jsx";
import UserProfile from "../pages/Dashboard/user/UserProfile.jsx";

// Owner Dashboard Views
import OwnerDashboard from "../pages/Dashboard/owner/OwnerDashboard.jsx";
import OwnerListings from "../pages/Dashboard/owner/OwnerListings.jsx";
import OwnerAddListing from "../pages/Dashboard/owner/OwnerAddListing.jsx";
import OwnerBookingRequests from "../pages/Dashboard/owner/OwnerBookingRequests.jsx";
import OwnerPayments from "../pages/Dashboard/owner/OwnerPayments.jsx";
import OwnerReviews from "../pages/Dashboard/owner/OwnerReviews.jsx";
import OwnerNotifications from "../pages/Dashboard/owner/OwnerNotifications.jsx";
import OwnerProfile from "../pages/Dashboard/owner/OwnerProfile.jsx";

// Admin Dashboard Views
import AdminDashboard from "../pages/Dashboard/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/Dashboard/admin/AdminUsers.jsx";
import AdminRentals from "../pages/Dashboard/admin/AdminRentals.jsx";
import AdminBookings from "../pages/Dashboard/admin/AdminBookings.jsx";
import AdminPayments from "../pages/Dashboard/admin/AdminPayments.jsx";
import AdminReviews from "../pages/Dashboard/admin/AdminReviews.jsx";
import AdminReports from "../pages/Dashboard/admin/AdminReports.jsx";

const UserRouteRedirect = () => {
  const location = useLocation();
  const newPath = location.pathname.replace(/^\/dashboard\/user/, '/dashboard/renter');
  return <Navigate to={`${newPath}${location.search}`} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "cars",
        element: <Cars />,
      },
      {
        path: "cars/:id",
        element: <CarDetails />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "checkout/thank-you",
        element: <ThankYou />,
      },
      {
        path: "about",
        element: <AboutUs />,
      },
      {
        path: "how-it-works",
        element: <Works />,
      },
      {
        path: "browse-rental",
        element: <BrowseRental />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "dashboard",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <DashboardRedirect />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "user/*",
            element: <UserRouteRedirect />
          },
          {
            path: "renter",
            element: <RoleRoute allowedRoles={["USER"]} />,
            children: [
              { index: true, element: <UserDashboard /> },
              { path: "bookings", element: <UserBookings /> },
              { path: "booking-history", element: <UserBookingHistory /> },
              { path: "wishlist", element: <UserWishlist /> },
              { path: "notifications", element: <UserNotifications /> },
              { path: "profile", element: <UserProfile /> },
            ],
          },
          {
            path: "owner",
            element: <RoleRoute allowedRoles={["OWNER"]} />,
            children: [
              { index: true, element: <OwnerDashboard /> },
              { path: "listings", element: <OwnerListings /> },
              { path: "add-listing", element: <OwnerAddListing /> },
              { path: "booking-requests", element: <OwnerBookingRequests /> },
              { path: "payments", element: <OwnerPayments /> },
              { path: "reviews", element: <OwnerReviews /> },
              { path: "notifications", element: <OwnerNotifications /> },
              { path: "profile", element: <OwnerProfile /> },
            ],
          },
          {
            path: "admin",
            element: <RoleRoute allowedRoles={["ADMIN"]} />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "users", element: <AdminUsers /> },
              { path: "rentals", element: <AdminRentals /> },
              { path: "bookings", element: <AdminBookings /> },
              { path: "payments", element: <AdminPayments /> },
              { path: "reviews", element: <AdminReviews /> },
              { path: "reports", element: <AdminReports /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;