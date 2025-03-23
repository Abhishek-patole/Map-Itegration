const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const rideRoutes = require("./routes/rideRoutes");
const mapRoutes = require("./routes/mapRoutes");
const Ride = require("./Models/rideModel");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Create HTTP Server for Socket.io
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ Attach `io` to `app` so that it can be accessed in other files
app.set("io", io);

// ✅ Routes
app.use("/rides", rideRoutes);
app.use("/map", mapRoutes);

// ✅ Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("joinRide", (rideId) => {
    socket.join(rideId);
    console.log(`User joined ride: ${rideId}`);
  });

  socket.on("disconnect", () => {
    console.log("⚡ Client disconnected");
  });
});

// ✅ Connect to MongoDB
connectDB();

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
