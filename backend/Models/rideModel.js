const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverContact: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  pickupLocation: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  dropoffLocation: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  route: {
    type: {
      type: String,
      enum: ["LineString"], // ✅ Fix: Allow "LineString" here
      required: true,
    },
    coordinates: {
      type: [[Number]], // Array of coordinates [[lng, lat], [lng, lat], ...]
      required: true,
    },
  },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  rideStatus: { type: String, enum: ["pending", "accepted", "completed"], default: "pending" },
  paymentMethod: { type: String, enum: ["cash", "online"], required: true },
});

module.exports = mongoose.model("Ride", RideSchema);
