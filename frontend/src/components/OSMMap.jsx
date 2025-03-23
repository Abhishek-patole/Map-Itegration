import React, { useState, useEffect } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidmVkaWtheSIsImEiOiJjbHU3Y2x1YmYwNGFuMmxudzdmOHo3YWwxIn0.dDD4vvXB83fTUhXZ94z38g"; // Replace with your actual key

const MapboxMap = () => {
  const [userLocation, setUserLocation] = useState({ latitude: 19.9975, longitude: 73.7898 });
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [riderName, setRiderName] = useState("");
const [seats, setSeats] = useState(1);
const [rideDate, setRideDate] = useState("");



  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setPickup({ latitude, longitude }); // Default Pickup: User's Location
          setPickupAddress(`Current Location: ${latitude}, ${longitude}`);
        },
        (error) => console.error("Error fetching location:", error)
      );
    }
  }, []);

  const geocodeAddress = async (address, isPickup) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
        { params: { access_token: MAPBOX_ACCESS_TOKEN, limit: 1 } }
      );

      if (response.data.features.length > 0) {
        const { center, place_name } = response.data.features[0];
        const location = { latitude: center[1], longitude: center[0] };

        if (isPickup) {
          setPickup(location);
          setPickupAddress(place_name);
        } else {
          setDropoff(location);
          setDropoffAddress(place_name);
        }
      } else {
        alert("Location not found. Try again.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const fetchRoute = async () => {
    if (!pickup || !dropoff) {
      alert("Please select both pickup and drop-off locations.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/route", {
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

  const resetMap = () => {
    setPickup(null);
    setDropoff(null);
    setRoute(null);
    setPickupAddress("");
    setDropoffAddress("");
    setDistance(null);
    setDuration(null);
  };

  const createRide = async () => {
    if (!pickup || !dropoff || !riderName || !rideDate || seats <= 0) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/create-ride", {
        riderName,
        pickup,
        dropoff,
        distance,
        duration,
        date: rideDate,
        seatsAvailable: seats,
      });
  
      alert("Ride Created Successfully!");
      console.log("Ride Created:", response.data);
    } catch (error) {
      console.error("Error creating ride:", error);
    }
  };

  const [availableRides, setAvailableRides] = useState([]);

useEffect(() => {
  const fetchRides = async () => {
    try {
      const response = await axios.get("http://localhost:5000/available-rides");
      setAvailableRides(response.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  fetchRides();
}, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Input Fields */}
      <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
        <input
          type="text"
          value={pickupAddress}
          placeholder="Enter Pickup Location"
          onChange={(e) => setPickupAddress(e.target.value)}
          onBlur={() => pickupAddress.trim() && geocodeAddress(pickupAddress, true)}
          style={{ padding: "10px", width: "250px", marginRight: "10px" }}
        />
        <input
          type="text"
          value={dropoffAddress}
          placeholder="Enter Drop-off Location"
          onChange={(e) => setDropoffAddress(e.target.value)}
          onBlur={() => dropoffAddress.trim() && geocodeAddress(dropoffAddress, false)}
          style={{ padding: "10px", width: "250px" }}
        />
        <button onClick={fetchRoute} style={{ padding: "10px", marginLeft: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
          Find Route
        </button>
        <button onClick={resetMap} style={{ padding: "10px", marginLeft: "10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px" }}>
          Reset
        </button>
      </div>

      {/* Ride Creation Form */}
<div style={{
  position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", 
  background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0,0,0,0.3)", 
  zIndex: 1000, textAlign: "center"
}}>
  <h3>Create a Ride</h3>
  <input type="text" placeholder="Your Name" value={riderName} onChange={(e) => setRiderName(e.target.value)}
    style={{ padding: "10px", width: "250px", marginBottom: "10px" }} />
  <input type="date" value={rideDate} onChange={(e) => setRideDate(e.target.value)}
    style={{ padding: "10px", width: "250px", marginBottom: "10px" }} />
  <input type="number" placeholder="Seats Available" value={seats} min="1" onChange={(e) => setSeats(e.target.value)}
    style={{ padding: "10px", width: "250px", marginBottom: "10px" }} />
  <button onClick={createRide} style={{ padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }}>
    Create Ride
  </button>
</div>

{/* Available Rides List */}
<div style={{
  position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)", 
  background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0,0,0,0.3)", 
  zIndex: 1000, textAlign: "center"
}}>
  <h3>Available Rides</h3>
  {availableRides.length === 0 ? (
    <p>No rides available</p>
  ) : (
    availableRides.map((ride, index) => (
      <div key={index} style={{ marginBottom: "10px", padding: "10px", background: "#f3f3f3", borderRadius: "5px" }}>
        <p><strong>Rider:</strong> {ride.riderName}</p>
        <p><strong>From:</strong> {ride.pickup.address}</p>
        <p><strong>To:</strong> {ride.dropoff.address}</p>
        <p><strong>Seats Left:</strong> {ride.seatsAvailable}</p>
        <button onClick={() => joinRide(ride._id)} style={{ padding: "5px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
          Join Ride
        </button>
      </div>
    ))
  )}
</div>


      {/* Display Distance & Duration */}
      {distance && duration && (
  <div style={{
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    background: "rgba(0, 0, 0, 0.8)",
    padding: "15px 20px",
    borderRadius: "10px",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
    minWidth: "300px",
  }}>
    🚗 <strong>Distance:</strong> {distance} km  
    ⏳ <strong>Time:</strong> {duration} min
  </div>
)}

      {/* Map */}
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
