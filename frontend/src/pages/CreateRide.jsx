import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate

const CreateRide = () => {
  const [driverContact, setDriverContact] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [rideId, setRideId] = useState(null); // ✅ Store Ride ID

  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleCreateRide = async () => {
    if (!pickupLocation || !dropoffLocation || !departureTime || !price || !seatsAvailable) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/rides/create", {
        driverId: "660d9b5fe82e9a4b10b65d92", // Replace with actual driver ID
        driverContact,
        vehicleType,
        vehicleNumber,
        pickupLocation,
        dropoffLocation,
        departureTime,
        price,
        seatsAvailable,
        paymentMethod,
      });

      alert("✅ Ride Created Successfully!");
      setRideId(response.data.ride._id); // ✅ Store rideId
      setLoading(false);
    } catch (error) {
      console.error("❌ Error creating ride:", error);
      alert("⚠️ Failed to create ride.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🚗 Create a Ride</h2>

        <div className="space-y-4">
          <input type="text" placeholder="Driver Contact" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} className="input-field" />
          <input type="text" placeholder="Vehicle Type (Car/Bike)" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input-field" />
          <input type="text" placeholder="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="input-field" />
          <input type="text" placeholder="Pickup Location" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="input-field" />
          <input type="text" placeholder="Drop-off Location" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} className="input-field" />
          <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="input-field" />
          <input type="number" placeholder="Seats Available" min="1" value={seatsAvailable} onChange={(e) => setSeatsAvailable(e.target.value)} className="input-field" />
          <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" />

          <label className="block text-gray-700 font-medium">Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </div>

        <button onClick={handleCreateRide} className={`w-full px-6 py-3 text-lg font-bold text-white rounded-xl transition-all mt-6 
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-400 to-green-600 hover:opacity-90"}`} disabled={loading}>
          {loading ? "Creating Ride..." : "✅ Create Ride"}
        </button>

        {/* ✅ Navigate to Driver Tracking */}
        {rideId && (
          <button
            onClick={() => navigate(`/driver-tracking/${rideId}`)}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
          >
            🚗 Track Ride (Driver)
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateRide;
