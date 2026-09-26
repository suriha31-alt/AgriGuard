const express = require("express");
const cors = require("cors");
require("dotenv").config();

const weatherRoutes = require("./routes/weatherRoutes");
const cropRecommendationRoutes = require("./routes/cropRecommendationRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/*
 * Middleware
 */
app.use(cors());
app.use(express.json());

/*
 * Home route
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgriGuard Backend is running"
    });
});

/*
 * Crop Recommendation API
 */
app.use(
    "/api/crop-recommendation",
    cropRecommendationRoutes
);

/*
 * Weather API
 */
app.use(
    "/api/weather",
    weatherRoutes
);

/*
 * Authentication API
 */
app.use(
    "/api/auth",
    authRoutes
);

/*
 * Farmer Profile API
 */
app.use(
    "/api/profile",
    profileRoutes
);

/*
 * Government Schemes API
 */
app.use(
    "/api/schemes",
    schemeRoutes
);

/*
 * 404
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

/*
 * Start server
 */
app.listen(PORT, () => {
    console.log(
        `AgriGuard Backend running on port ${PORT}`
    );
});