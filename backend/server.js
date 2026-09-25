const express = require("express");
const cors = require("cors");
require("dotenv").config();

const weatherRoutes = require("./routes/weatherRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgriGuard Backend is running"
    });
});

// API routes
app.use("/api/weather", weatherRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AgriGuard Backend running on port ${PORT}`);
});