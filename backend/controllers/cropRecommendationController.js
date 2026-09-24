const {
    getCropRecommendations
} = require("../services/cropRecommendationService");

/*
|--------------------------------------------------------------------------
| Crop Recommendation Controller
|--------------------------------------------------------------------------
*/

const recommendCrops = async (req, res) => {
    try {
        const input = req.body;

        if (!input) {
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }

        const requiredFields = [
            "nitrogen",
            "phosphorus",
            "potassium",
            "temperature",
            "humidity",
            "ph",
            "rainfall",
            "soil_type",
            "farm_size_acres",
            "irrigation_available",
            "soil_organic_matter"
        ];

        const missingFields = requiredFields.filter(
            field =>
                input[field] === undefined ||
                input[field] === null ||
                input[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                missingFields
            });
        }

        const result = await getCropRecommendations(input);

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error(
            "Crop recommendation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate crop recommendations",
            error: error.message
        });
    }
};

module.exports = {
    recommendCrops
};