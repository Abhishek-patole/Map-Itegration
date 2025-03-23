import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; // ✅ Use environment variable

const ConfirmRide = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [pickupAddress, setPickupAddress] = useState("Fetching...");
  const [dropoffAddress, setDropoffAddress] = useState("Fetching...");

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/rides/${rideId}`);
        const rideData = response.data;
        setRide(rideData);

        // ✅ Fetch addresses using reverse geocoding
        if (rideData.pickupLocation?.coordinates) {
          getPlaceName(rideData.pickupLocation.coordinates, setPickupAddress);
        }
        if (rideData.dropoffLocation?.coordinates) {
          getPlaceName(rideData.dropoffLocation.coordinates, setDropoffAddress);
        }
      } catch (error) {
        console.error("Error fetching ride details:", error);
        setError("Failed to fetch ride details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  // ✅ Convert coordinates to a readable address using Mapbox API
  const getPlaceName = async (coordinates, setAddress) => {
    try {
      const [longitude, latitude] = coordinates;
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: MAPBOX_API_KEY,
            limit: 1,
          },
        }
      );

      if (response.data.features.length > 0) {
        setAddress(response.data.features[0].place_name);
      } else {
        setAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unknown Location");
    }
  };

  const confirmRide = async () => {
    try {
      await axios.post(`http://localhost:5000/rides/confirm/${rideId}`, { paymentMethod });
      alert("✅ Ride Confirmed!");
      navigate(`/passenger-tracking/${rideId}`);
    } catch (error) {
      console.error("Error confirming ride:", error.response ? error.response.data : error.message);
      alert("Failed to confirm the ride. Please try again.");
    }
  };

  if (loading) return <h3 className="text-blue-500 text-lg text-center">⏳ Loading Ride Details...</h3>;
  if (error) return <h3 className="text-red-500 text-lg text-center">❌ {error}</h3>;
  if (!ride) return <h3 className="text-red-500 text-lg text-center">❌ Ride Not Found</h3>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">🚖 Confirm Your Ride</h2>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-left">
        <p className="text-lg"><strong>🛑 Pickup:</strong> {pickupAddress}</p>
        <p className="text-lg"><strong>🏁 Drop-off:</strong> {dropoffAddress}</p>
        <p className="text-lg"><strong>💰 Price:</strong> ₹{ride.price}</p>
        <p className="text-lg"><strong>📞 Driver Contact:</strong> {ride.driverContact}</p>
        <p className="text-lg"><strong>🚗 Vehicle:</strong> {ride.vehicleType} ({ride.vehicleNumber})</p>

        <label className="block font-semibold mt-4">💳 Payment Method:</label>
        <select 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded mt-2"
        >
          <option value="cash">Cash</option>
          <option value="online">Online</option>
        </select>

        <button 
          type="button" 
          onClick={confirmRide} 
          className="w-full bg-green-500 text-white font-bold py-3 px-4 mt-4 rounded-lg hover:bg-green-600 transition"
        >
          ✅ Confirm Ride
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
