
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const {
    testDatabaseConnection
} = require("./services/databaseService");

const weatherRoutes = require("./routes/weatherRoutes");
const cropRecommendationRoutes = require("./routes/cropRecommendationRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgriGuard Backend is running"
    });
});

app.use("/api/crop-recommendation", cropRecommendationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/schemes", schemeRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

async function startServer() {
    await testDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`AgriGuard Backend running on port ${PORT}`);
    });
}

startServer();
