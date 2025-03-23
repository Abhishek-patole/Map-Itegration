const express = require("express");
const axios = require("axios");
const router = express.Router();

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

// Fetch Route from Mapbox
router.get("/route", async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Start and End locations are required." });
  }

  try {
    console.log(`📍 Fetching route from: ${start} to ${end}`);

    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_API_KEY}`
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found. Try a different location." });
    }

    const routeData = response.data.routes[0];

    res.json({
      geometry: routeData.geometry,
      distance: (routeData.distance / 1000).toFixed(2), // Convert meters to KM
      duration: (routeData.duration / 60).toFixed(2), // Convert seconds to minutes
    });
  } catch (error) {
    console.error("❌ Mapbox API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch route from Mapbox", details: error.response ? error.response.data : error.message });
  }
});

module.exports = router;
