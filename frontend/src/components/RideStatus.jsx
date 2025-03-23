import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const RideStatus = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/rides/${rideId}`);
        setRide(response.data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      }
    };

    fetchRide();
    socket.emit("joinRide", rideId);
    socket.on("rideStatusUpdated", (updatedRide) => {
      setRide(updatedRide);
    });

    return () => socket.off("rideStatusUpdated");
  }, [rideId]);

  if (!ride) return <p>Loading ride details...</p>;

  return (
    <div style={styles.container}>
      <h2>Ride Status</h2>
      <p><strong>Driver:</strong> {ride.driverContact}</p>
      <p><strong>Vehicle:</strong> {ride.vehicleType} ({ride.vehicleNumber})</p>
      <p><strong>Status:</strong> <span style={styles.status}>{ride.rideStatus.toUpperCase()}</span></p>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  status: {
    padding: "5px 10px",
    borderRadius: "5px",
    background: "#ffcc00",
  },
};

export default RideStatus;
