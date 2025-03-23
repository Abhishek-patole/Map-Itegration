import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // ✅ Connect to backend
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; // ✅ Use environment variable

const DriverTracking = () => {
  const { rideId } = useParams();
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [error, setError] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("Fetching...");
  const [dropoffAddress, setDropoffAddress] = useState("Fetching...");

  // ✅ Fetch ride details
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/rides/${rideId}`);
        const rideData = response.data;

        setRideDetails(rideData);

        if (rideData.rideStatus === "accepted") {
          setConfirmationMessage("✅ Passenger has confirmed the ride!");
        }

        // ✅ Fetch addresses using reverse geocoding
        if (rideData.pickupLocation?.coordinates) {
          getPlaceName(rideData.pickupLocation.coordinates, setPickupAddress);
        }
        if (rideData.dropoffLocation?.coordinates) {
          getPlaceName(rideData.dropoffLocation.coordinates, setDropoffAddress);
        }
      } catch (error) {
        console.error("❌ Error fetching ride details:", error);
        setError("Failed to load ride details.");
      }
    };

    fetchRideDetails();
    socket.emit("joinRide", rideId); // ✅ Join ride room

    // ✅ Listen for ride confirmation
    socket.on("rideConfirmed", (data) => {
      console.log("✅ Driver Notification:", data);
      setConfirmationMessage(data.message);
    });

    return () => {
      socket.off("rideConfirmed"); // ✅ Clean up listener
    };
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">🚗 Driver Tracking</h2>

        {error && <div className="bg-red-500 text-white px-4 py-2 rounded-md">{error}</div>}

        {confirmationMessage && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-md text-center text-lg font-semibold mb-4">
            {confirmationMessage}
          </div>
        )}

        {rideDetails && (
          <div className="bg-gray-100 p-5 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Ride Details</h3>
            <p className="text-lg text-gray-600"><strong>🛑 Pickup:</strong> {pickupAddress}</p>
            <p className="text-lg text-gray-600"><strong>🏁 Dropoff:</strong> {dropoffAddress}</p>
            <p className="text-lg text-gray-600"><strong>🚗 Vehicle:</strong> {rideDetails.vehicleType} ({rideDetails.vehicleNumber})</p>
            <p className="text-lg text-gray-600"><strong>💰 Price:</strong> ₹{rideDetails.price}</p>
            
            <p className={`text-lg font-bold ${rideDetails.rideStatus === "accepted" ? "text-green-600" : "text-yellow-600"}`}>
              <strong>📌 Status:</strong> {rideDetails.rideStatus === "accepted" ? "✔ Ride Confirmed" : "⏳ Pending Confirmation"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTracking;
