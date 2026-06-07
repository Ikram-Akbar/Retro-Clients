const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About Rentro
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Rentro is a trusted vehicle rental marketplace that connects vehicle
          owners with renters, making transportation more accessible,
          affordable, and convenient for everyone.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Rentro was founded with a simple vision: to make vehicle rentals
            easy, transparent, and accessible. Whether you need a car for a
            weekend trip, a motorcycle for daily commuting, or a van for
            business purposes, Rentro helps you find the perfect vehicle.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We believe that sharing resources creates value for everyone.
            Vehicle owners can earn extra income, while renters enjoy flexible
            and affordable transportation options.
          </p>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
            alt="Vehicle Rental"
            className="rounded-2xl shadow-lg w-full"
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white shadow-md rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
          <p className="text-gray-600">
            To simplify vehicle rentals by providing a secure, reliable, and
            user-friendly platform that benefits both renters and owners.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
          <p className="text-gray-600">
            To become the leading vehicle rental marketplace where mobility is
            accessible to everyone, anytime and anywhere.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose Rentro?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl text-center">
            <h4 className="text-xl font-semibold mb-3">Verified Listings</h4>
            <p className="text-gray-600">
              Every vehicle is reviewed to ensure quality and reliability.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl text-center">
            <h4 className="text-xl font-semibold mb-3">Secure Booking</h4>
            <p className="text-gray-600">
              Safe payments and transparent rental agreements.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl text-center">
            <h4 className="text-xl font-semibold mb-3">Affordable Pricing</h4>
            <p className="text-gray-600">
              Competitive rates with flexible rental durations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-indigo-50 p-6 rounded-xl">
          <h3 className="text-3xl font-bold text-indigo-600">500+</h3>
          <p className="text-gray-600">Vehicles</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl">
          <h3 className="text-3xl font-bold text-indigo-600">1,000+</h3>
          <p className="text-gray-600">Happy Customers</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl">
          <h3 className="text-3xl font-bold text-indigo-600">50+</h3>
          <p className="text-gray-600">Cities Covered</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl">
          <h3 className="text-3xl font-bold text-indigo-600">24/7</h3>
          <p className="text-gray-600">Support</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;