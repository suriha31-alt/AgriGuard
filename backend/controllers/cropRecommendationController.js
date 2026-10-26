
const {
    getCropRecommendations
} = require("../services/cropRecommendationService");

/*
|--------------------------------------------------------------------------
| Crop Recommendation Controller
|--------------------------------------------------------------------------
| Handles crop recommendation requests.
| NPK values are optional. All other configured fields are required.
|--------------------------------------------------------------------------
*/

const recommendCrops = async (req, res) => {
    try {
        const input = req.body;

        // 1. Validate request body
        if (
            !input ||
            typeof input !== "object" ||
            Array.isArray(input) ||
            Object.keys(input).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid request body is required."
            });
        }

        // 2. Determine whether all three NPK values are provided
        const npkFields = [
            "nitrogen",
            "phosphorus",
            "potassium"
        ];

        const npkProvided = npkFields.every(field =>
            input[field] !== null &&
            input[field] !== undefined &&
            input[field] !== ""
        );

        // Validate NPK values only when all three are provided.
        const npkAvailable =
            npkProvided &&
            npkFields.every(field =>
                Number.isFinite(Number(input[field]))
            );

        if (npkProvided && !npkAvailable) {
            return res.status(400).json({
                success: false,
                message: "NPK values must be valid numbers.",
                invalidFields: npkFields.filter(field =>
                    !Number.isFinite(Number(input[field]))
                )
            });
        }

        // 3. Validate required fields (NPK excluded)
        const requiredFields = [
            "temperature",
            "humidity",
            "ph",
            "rainfall",
            "soil_type",
            "farm_size_acres",
            "irrigation_available",
            "water_source",
            "soil_organic_matter"
        ];

        const missingFields = requiredFields.filter(field =>
            input[field] === undefined ||
            input[field] === null ||
            input[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required crop details.",
                missingFields
            });
        }

        // 4. Validate numeric fields
        const numericFields = [
            "temperature",
            "humidity",
            "ph",
            "rainfall",
            "farm_size_acres",
            "soil_organic_matter"
        ];

        const invalidFields = numericFields.filter(field =>
            !Number.isFinite(Number(input[field]))
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some numeric fields contain invalid values.",
                invalidFields
            });
        }

        // 5. Validate important numeric ranges
        const numericValues = Object.fromEntries(
            numericFields.map(field => [
                field,
                Number(input[field])
            ])
        );

        const rangeErrors = [];

        if (
            numericValues.humidity < 0 ||
            numericValues.humidity > 100
        ) {
            rangeErrors.push("humidity must be between 0 and 100.");
        }

        if (
            numericValues.ph < 0 ||
            numericValues.ph > 14
        ) {
            rangeErrors.push("ph must be between 0 and 14.");
        }

        if (numericValues.rainfall < 0) {
            rangeErrors.push("rainfall cannot be negative.");
        }

        if (numericValues.farm_size_acres <= 0) {
            rangeErrors.push("farm_size_acres must be greater than 0.");
        }

        if (numericValues.soil_organic_matter < 0) {
            rangeErrors.push("soil_organic_matter cannot be negative.");
        }

        if (rangeErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please correct the invalid field values.",
                errors: rangeErrors
            });
        }

        // 6. Prepare normalized service input
        const recommendationMode = npkAvailable
            ? "npk"
            : "no_npk";

        const recommendationInput = {
            ...input,
            ...numericValues,

            nitrogen: npkAvailable
                ? Number(input.nitrogen)
                : null,

            phosphorus: npkAvailable
                ? Number(input.phosphorus)
                : null,

            potassium: npkAvailable
                ? Number(input.potassium)
                : null,

            recommendation_mode: recommendationMode
        };

        console.log(
            `[CropRecommendation] Mode: ${recommendationMode}`
        );

        // 7. Call recommendation service
        const result = await getCropRecommendations(
            recommendationInput
        );

        // 8. Check service response
        if (
            result === null ||
            result === undefined ||
            typeof result !== "object" ||
            Array.isArray(result)
        ) {
            console.error(
                "[CropRecommendation] Invalid service response:",
                result
            );

            return res.status(502).json({
                success: false,
                message: "The recommendation service returned an invalid response."
            });
        }

        // 9. Send successful response
        return res.status(200).json({
            success: true,
            recommendation_mode: recommendationMode,
            npk_available: npkAvailable,
            ...result
        });

    } catch (error) {
        // 10. Log the real error for debugging
        console.error(
            "[CropRecommendation] Service failed:",
            error.stack || error.message || error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate crop recommendations.",
            error: error.message || "Unknown server error."
        });
    }
};

module.exports = {
    recommendCrops
};
