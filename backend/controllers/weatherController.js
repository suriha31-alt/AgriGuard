const {
    getWeatherData
} = require("../services/weatherService");


async function getWeather(req, res) {

    try {

        const {
            lat,
            lon
        } = req.query;


        // Check parameters
        if (!lat || !lon) {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude and longitude are required"
            });
        }


        const latitude = Number(lat);

        const longitude = Number(lon);


        // Check numbers
        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude and longitude must be valid numbers"
            });
        }


        // Latitude validation
        if (
            latitude < -90 ||
            latitude > 90
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude must be between -90 and 90"
            });
        }


        // Longitude validation
        if (
            longitude < -180 ||
            longitude > 180
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Longitude must be between -180 and 180"
            });
        }


        // Get weather
        const weatherData =
            await getWeatherData(
                latitude,
                longitude
            );


        return res.json({

            success: true,

            data: weatherData
        });


    } catch (error) {

        console.error(
            "Weather Controller Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch weather data"
        });
    }
}


module.exports = {
    getWeather
};