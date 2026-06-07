const Works = () => {
  const steps = [
    {
      id: 1,
      title: "Browse Vehicles",
      description:
        "Explore a wide range of cars, bikes, and vans available for rent in your preferred location.",
      icon: "🚗",
    },
    {
      id: 2,
      title: "Choose & Book",
      description:
        "Select your preferred vehicle, choose rental dates, and submit your booking request.",
      icon: "📅",
    },
    {
      id: 3,
      title: "Confirm Rental",
      description:
        "The vehicle owner reviews your request and confirms the booking.",
      icon: "✅",
    },
    {
      id: 4,
      title: "Enjoy Your Ride",
      description:
        "Pick up the vehicle and enjoy a safe and hassle-free rental experience.",
      icon: "🛣️",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          How Rentro Works
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Renting a vehicle has never been easier. Follow these simple steps
          to book your perfect ride.
        </p>
      </div>

      {/* Steps Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">{step.icon}</div>

            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-bold">
              {step.id}
            </div>

            <h3 className="text-xl font-semibold mb-3">
              {step.title}
            </h3>

            <p className="text-gray-600">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 rounded-3xl p-10">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Rent With Us?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-semibold mb-2">
              Secure Booking
            </h3>
            <p className="text-gray-600">
              Safe transactions and verified vehicle listings.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-semibold mb-2">
              Affordable Prices
            </h3>
            <p className="text-gray-600">
              Competitive rental rates with flexible plans.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-semibold mb-2">
              Trusted Community
            </h3>
            <p className="text-gray-600">
              Rent confidently from verified owners and renters.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-20">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Find Your Next Ride?
        </h2>

        <p className="text-gray-600 mb-6">
          Browse hundreds of vehicles and book in just a few clicks.
        </p>

        <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
          Browse Rentals
        </button>
      </div>
    </div>
  );
};

export default Works;