import React from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const RideControl = ({ rideId }) => {
  const updateStatus = async (status) => {
    try {
      await axios.post(`http://localhost:5000/rides/update-status/${rideId}`, { status });
      socket.emit("updateRideStatus", { rideId, status });
    } catch (error) {
      console.error("Error updating ride status:", error);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => updateStatus("in-progress")} style={styles.button}>🚗 Start Ride</button>
      <button onClick={() => updateStatus("completed")} style={styles.button}>✅ Complete Ride</button>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default RideControl;
