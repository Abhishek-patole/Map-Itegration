import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Map, { Source, Layer } from "react-map-gl";
import axios from "axios";

const PassengerTracking = () => {
  const { rideId } = useParams();
  const [route, setRoute] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/rides/${rideId}`);
        console.log("🚀 Ride Data:", response.data);

        if (response.data.route) {
          setRoute(response.data.route);
        } else {
          console.error("❌ No route geometry received from backend.");
          setError("No route available.");
        }

        if (response.data.pickupLocation && response.data.dropoffLocation) {
          console.log("📍 Pickup:", response.data.pickupLocation.coordinates);
          console.log("📍 Dropoff:", response.data.dropoffLocation.coordinates);

          setPickup({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: response.data.pickupLocation.coordinates, // [longitude, latitude]
            },
            properties: {
              title: "Start Location",
            },
          });

          setDropoff({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: response.data.dropoffLocation.coordinates, // [longitude, latitude]
            },
            properties: {
              title: "End Location",
            },
          });
        } else {
          console.error("❌ Missing pickup or dropoff location in response.");
          setError("Invalid pickup or dropoff location.");
        }
      } catch (error) {
        console.error("❌ Error fetching ride details:", error);
        setError("Failed to fetch ride details.");
      }
    };

    fetchRideDetails();
  }, [rideId]);

  return (
    <div className="relative w-screen h-screen">
      <h3 className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-10">
        🚗 Tracking Ride...
      </h3>

      {error && (
        <p className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          latitude: pickup ? pickup.geometry.coordinates[1] : 19.9975,
          longitude: pickup ? pickup.geometry.coordinates[0] : 73.7898,
          zoom: 12,
        }}
        className="w-full h-full"
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {/* Pickup Circle (Larger Visibility) */}
        {pickup && (
          <Source id="pickupCircleSource" type="geojson" data={{ type: "FeatureCollection", features: [pickup] }}>
            <Layer
              id="pickupCircle"
              type="circle"
              paint={{
                "circle-radius": 10, // Bigger size
                "circle-color": "#1E90FF", // Bright Blue
                "circle-stroke-width": 3,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        )}

        {/* Dropoff Circle (Larger Visibility) */}
        {dropoff && (
          <Source id="dropoffCircleSource" type="geojson" data={{ type: "FeatureCollection", features: [dropoff] }}>
            <Layer
              id="dropoffCircle"
              type="circle"
              paint={{
                "circle-radius": 10, // Bigger size
                "circle-color": "#FF5733", // Bright Orange
                "circle-stroke-width": 3,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        )}

        {/* Pickup Icon */}
        {pickup && (
          <Source id="pickupSource" type="geojson" data={{ type: "FeatureCollection", features: [pickup] }}>
            <Layer
              id="pickupLayer"
              type="symbol"
              layout={{
                "icon-image": "rocket-15", // Custom Mapbox icon (change as needed)
                "icon-size": 2.5, // Bigger icon
                "text-field": ["get", "title"],
                "text-size": 14,
                "text-offset": [0, 2],
                "text-anchor": "top",
              }}
              paint={{
                "text-color": "#1E90FF",
              }}
            />
          </Source>
        )}

        {/* Dropoff Icon */}
        {dropoff && (
          <Source id="dropoffSource" type="geojson" data={{ type: "FeatureCollection", features: [dropoff] }}>
            <Layer
              id="dropoffLayer"
              type="symbol"
              layout={{
                "icon-image": "embassy-15", // Custom Mapbox icon (change as needed)
                "icon-size": 2.5, // Bigger icon
                "text-field": ["get", "title"],
                "text-size": 14,
                "text-offset": [0, 2],
                "text-anchor": "top",
              }}
              paint={{
                "text-color": "#FF5733",
              }}
            />
          </Source>
        )}

        {/* Route Line */}
        {route && (
          <Source id="routeSource" type="geojson" data={{ type: "Feature", geometry: route }}>
            <Layer id="routeLayer" type="line" paint={{ "line-color": "#0000FF", "line-width": 5 }} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default PassengerTracking;
