const express = require("express");
const cors = require("cors");
require("dotenv").config();

const weatherRoutes = require("./routes/weatherRoutes");
const schemeRoutes = require("./routes/schemeRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgriGuard Backend is running"
    });
});

// Weather API
app.use("/api/weather", weatherRoutes);
app.use("/api/schemes", schemeRoutes);

// 404 handler
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