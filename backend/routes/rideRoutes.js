const express = require("express");
const Ride = require("../Models/rideModel");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

// ✅ Get `io` instance from `app`
const getIoInstance = (req) => req.app.get("io");

// ✅ Helper function to get coordinates from Mapbox
const getCoordinates = async (address) => {
  try {
    console.log("🔹 Fetching coordinates for:", address);

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      { params: { access_token: MAPBOX_API_KEY, limit: 1 } }
    );

    if (response.data.features.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return { type: "Point", coordinates: [longitude, latitude] };
    } else {
      throw new Error(`❌ Location not found for "${address}"`);
    }
  } catch (error) {
    console.error("❌ Error fetching coordinates:", error);
    throw error;
  }
};

// ✅ Find rides near pickup location
router.get("/find", async (req, res) => {
  try {
    let { pickup, dropoff } = req.query;

    if (!pickup || !dropoff) {
      return res.status(400).json({ error: "Pickup and drop-off coordinates are required." });
    }

    // Convert "longitude,latitude" to array
    pickup = pickup.split(",").map(Number);
    dropoff = dropoff.split(",").map(Number);

    // ✅ Find rides within 50km of pickup location
    const rides = await Ride.find({
      "pickupLocation.coordinates": {
        $geoWithin: {
          $centerSphere: [pickup, 50 / 6378.1], // 50 km radius
        },
      },
      rideStatus: "pending",
    });

    res.json(rides);
  } catch (error) {
    console.error("❌ Error finding rides:", error);
    res.status(500).json({ error: "Failed to fetch rides" });
  }
});


// ✅ Get ride details (includes route if exists)
router.get("/:rideId", async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.route) {
      return res.json(ride);
    }

    // Fetch route from Mapbox API
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${ride.pickupLocation.coordinates.join(",")};${ride.dropoffLocation.coordinates.join(",")}?geometries=geojson&access_token=${MAPBOX_API_KEY}`
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found from Mapbox" });
    }

    ride.route = response.data.routes[0].geometry;
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error("❌ Error fetching ride:", error);
    res.status(500).json({ error: "Failed to fetch ride details" });
  }
});

// ✅ Confirm ride & notify driver
router.post("/confirm/:rideId", async (req, res) => {
  try {
    const io = getIoInstance(req);

    console.log("🔹 Full Request:", req.params, req.body);
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      console.log("❌ Ride not found in DB");
      return res.status(404).json({ error: "Ride not found" });
    }

    ride.rideStatus = "accepted";
    ride.paymentMethod = paymentMethod;
    await ride.save();

    console.log("✅ Ride Confirmed:", ride);

    // ✅ Notify the driver
    io.to(ride.driverId.toString()).emit("rideConfirmed", {
      rideId: ride._id,
      message: "A passenger has chosen your ride!",
    });

    res.json({ message: "Ride confirmed successfully", ride });
  } catch (error) {
    console.error("❌ Error confirming ride:", error);
    res.status(500).json({ error: "Failed to confirm ride" });
  }
});

// ✅ Create a new ride
router.post("/create", async (req, res) => {
  try {
    const {
      driverId,
      driverContact,
      vehicleType,
      vehicleNumber,
      pickupLocation,
      dropoffLocation,
      departureTime,
      price,
      seatsAvailable,
      paymentMethod,
    } = req.body;

    if (
      !driverId || !pickupLocation || !dropoffLocation ||
      !departureTime || !price || seatsAvailable === undefined || seatsAvailable < 1
    ) {
      return res.status(400).json({ error: "All required fields must be filled, and seatsAvailable must be at least 1" });
    }

    const pickupCoords = await getCoordinates(pickupLocation);
    const dropoffCoords = await getCoordinates(dropoffLocation);

    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.coordinates.join(",")};${dropoffCoords.coordinates.join(",")}?geometries=geojson&access_token=${MAPBOX_API_KEY}`
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found from Mapbox");
    }

    const routeData = response.data.routes[0].geometry;
    const distance = response.data.routes[0].distance / 1000;
    const duration = Math.round(response.data.routes[0].duration / 60);
    const arrivalTime = new Date(Date.now() + response.data.routes[0].duration * 1000);

    const ride = new Ride({
      driverId,
      driverContact,
      vehicleType,
      vehicleNumber,
      pickupLocation: pickupCoords,
      dropoffLocation: dropoffCoords,
      departureTime,
      arrivalTime,
      distance,
      duration,
      price,
      rideStatus: "pending",
      paymentMethod,
      route: {
        type: "LineString",
        coordinates: routeData.coordinates,
      },
    });

    await ride.save();
    res.status(201).json({ message: "✅ Ride created successfully!", ride });
  } catch (error) {
    console.error("❌ Error creating ride:", error);
    res.status(500).json({ error: "Failed to create ride" });
  }
});




module.exports = router;
