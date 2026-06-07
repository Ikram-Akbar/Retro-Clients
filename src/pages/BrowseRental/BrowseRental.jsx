const BrowseRental = () => {
  const vehicles = [
    {
      id: 1,
      name: "Toyota Corolla",
      image:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
      price: 3500,
      location: "Dhaka",
      type: "Car",
    },
    {
      id: 2,
      name: "Honda CBR 150R",
      image:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
      price: 1200,
      location: "Chattogram",
      type: "Bike",
    },
    {
      id: 3,
      name: "Toyota Hiace",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
      price: 5000,
      location: "Sylhet",
      type: "Van",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Browse Rentals
        </h1>
        <p className="text-gray-600 mt-2">
          Find the perfect vehicle for your next trip.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white shadow-md rounded-2xl p-5 mb-10">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search vehicle..."
            className="input input-bordered w-full"
          />

          <select className="select select-bordered w-full">
            <option>All Types</option>
            <option>Car</option>
            <option>Bike</option>
            <option>Van</option>
          </select>

          <select className="select select-bordered w-full">
            <option>All Locations</option>
            <option>Dhaka</option>
            <option>Chattogram</option>
            <option>Sylhet</option>
          </select>

          <button className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Vehicle Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-56 object-cover"
            />

            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">
                  {vehicle.name}
                </h3>

                <span className="bg-indigo-100 text-indigo-600 text-sm px-3 py-1 rounded-full">
                  {vehicle.type}
                </span>
              </div>

              <p className="text-gray-500 mb-3">
                📍 {vehicle.location}
              </p>

              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-indigo-600">
                  ৳{vehicle.price}
                  <span className="text-sm text-gray-500">/day</span>
                </p>

                <button className="btn btn-primary btn-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseRental;