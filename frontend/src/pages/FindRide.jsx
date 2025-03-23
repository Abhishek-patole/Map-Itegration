import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FindRide = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const findRides = async () => {
    if (!pickup || !dropoff) {
      setErrorMessage("❌ Please enter both pickup and drop-off locations.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get("http://localhost:5000/rides/find", {
        params: { pickup, dropoff },
      });

      if (response.data.length > 0) {
        setAvailableRides(response.data);
      } else {
        setAvailableRides([]);
        setErrorMessage("❌ No rides available for this route.");
      }
    } catch (error) {
      console.error("❌ Error finding rides:", error);
      setErrorMessage("❌ Error finding rides. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🚗 Find a Ride</h2>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Enter Pickup Location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Enter Drop-off Location"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={findRides}
          className={`px-6 py-2 text-white font-semibold rounded-md transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={loading}
        >
          {loading ? "🔄 Searching..." : "🔍 Search Rides"}
        </button>
      </div>

      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

      {availableRides.length > 0 && (
        <div className="w-full max-w-2xl mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Rides</h3>
          {availableRides.map((ride) => (
            <div key={ride._id} className="bg-white shadow-md rounded-lg p-4 mb-4">
              <p><strong>👤 Driver:</strong> {ride.driverContact}</p>
              <p><strong>🚗 Vehicle:</strong> {ride.vehicleType} ({ride.vehicleNumber})</p>
              <p><strong>💰 Price:</strong> ₹{ride.price}</p>
              
              <button
                onClick={() => navigate(`/confirm-ride/${ride._id}`)}
                className="mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
              >
                ✅ Select Ride
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindRide;