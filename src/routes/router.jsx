import { createBrowserRouter } from "react-router";
import Main from "../layouts/Main.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import Home from "../pages/Home/Home.jsx";
import Cars from "../pages/Cars/Cars.jsx";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import AboutUs from "../pages/AboutUs/AboutUs.jsx";
import Works from "../pages/HowItWorks/Works.jsx";
import BrowseRental from "../pages/BrowseRental/BrowseRental.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import UserDashboard from "../pages/Dashboard/UserDashboard.jsx";
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
        path: "register",
        element: <Register />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "dashboard",
            element: <UserDashboard />,
          },
        ],
      },
    ],
  },
]);

export default router;