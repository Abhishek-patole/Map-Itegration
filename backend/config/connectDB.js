const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://abhishekpatoles13:PZhXRmuOT772nAPb@cluster0.hd6wt.mongodb.net/Bike-pulling?retryWrites=true&w=majority&appName=Cluster0');
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB; // ✅ Correct CommonJS export
