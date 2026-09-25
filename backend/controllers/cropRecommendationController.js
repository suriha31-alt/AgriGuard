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


        /*
        |--------------------------------------------------------------------------
        | Check request body
        |--------------------------------------------------------------------------
        */

        if (!input) {

            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });

        }


        /*
        |--------------------------------------------------------------------------
        | NPK is OPTIONAL
        |--------------------------------------------------------------------------
        |
        | Farmer can:
        |
        | 1. Provide NPK values
        | 2. Leave NPK as null if they don't know them
        |
        */

        const npkAvailable =
            input.nitrogen !== null &&
            input.nitrogen !== undefined &&
            input.nitrogen !== "" &&

            input.phosphorus !== null &&
            input.phosphorus !== undefined &&
            input.phosphorus !== "" &&

            input.potassium !== null &&
            input.potassium !== undefined &&
            input.potassium !== "";


        /*
        |--------------------------------------------------------------------------
        | Required fields EXCEPT NPK
        |--------------------------------------------------------------------------
        */

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


        const missingFields = requiredFields.filter(
            field =>
                input[field] === undefined ||
                input[field] === null ||
                input[field] === ""
        );


        /*
        |--------------------------------------------------------------------------
        | Validate required fields
        |--------------------------------------------------------------------------
        */

        if (missingFields.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Missing required fields",

                missingFields

            });

        }


        /*
        |--------------------------------------------------------------------------
        | Determine recommendation mode
        |--------------------------------------------------------------------------
        */

        const recommendationMode =
            npkAvailable
                ? "npk"
                : "no_npk";


        /*
        |--------------------------------------------------------------------------
        | Log mode
        |--------------------------------------------------------------------------
        */

        console.log(
            `Crop recommendation mode: ${recommendationMode}`
        );


        /*
        |--------------------------------------------------------------------------
        | Send request to recommendation service
        |--------------------------------------------------------------------------
        */

        const result =
            await getCropRecommendations({

                ...input,

                nitrogen:
                    npkAvailable
                        ? Number(input.nitrogen)
                        : null,

                phosphorus:
                    npkAvailable
                        ? Number(input.phosphorus)
                        : null,

                potassium:
                    npkAvailable
                        ? Number(input.potassium)
                        : null,

                recommendation_mode:
                    recommendationMode

            });


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            recommendation_mode:
                recommendationMode,

            npk_available:
                npkAvailable,

            ...result

        });


    } catch (error) {


        console.error(
            "Crop recommendation error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate crop recommendations",

            error:
                error.message

        });

    }

};


module.exports = {
    recommendCrops
};