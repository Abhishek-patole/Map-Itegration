import React, { useState, useEffect } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

// ✅ Use import.meta.env for Vite OR process.env for Create React App
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = ({ pickup, setPickup, dropoff, setDropoff, distance, setDistance, duration, setDuration }) => {
  const [userLocation, setUserLocation] = useState({ latitude: 19.9975, longitude: 73.7898 });
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setPickup({ latitude, longitude });
        },
        (error) => console.error("Error fetching location:", error)
      );
    }
  }, []);

  const fetchRoute = async () => {
    if (!pickup || !dropoff) {
      alert("Please select both pickup and drop-off locations.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/map/route", {
        params: {
          start: `${pickup.longitude},${pickup.latitude}`,
          end: `${dropoff.longitude},${dropoff.latitude}`,
        },
      });

      if (response.data.geometry) {
        setRoute(response.data.geometry);
        setDistance(response.data.distance);
        setDuration(response.data.duration);
      } else {
        alert("No route found. Try different locations.");
        setRoute(null);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <button onClick={fetchRoute} style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", zIndex: 1000 }}>
        Find Route
      </button>

      <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} initialViewState={{ ...userLocation, zoom: 12 }} style={{ width: "100vw", height: "100vh" }} mapStyle="mapbox://styles/mapbox/streets-v11">
        {pickup && <Marker latitude={pickup.latitude} longitude={pickup.longitude} color="blue" />}
        {dropoff && <Marker latitude={dropoff.latitude} longitude={dropoff.longitude} color="green" />}
        {route && <Source id="routeSource" type="geojson" data={{ type: "Feature", geometry: route }}>
          <Layer id="routeLayer" type="line" paint={{ "line-color": "#ff0000", "line-width": 5 }} />
        </Source>}
      </Map>
    </div>
  );
};

export default MapboxMap;
