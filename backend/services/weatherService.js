const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

// Convert Open-Meteo weather code into readable text
function getWeatherCondition(code) {
    const conditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",

        45: "Fog",
        48: "Depositing rime fog",

        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",

        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",

        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",

        66: "Light freezing rain",
        67: "Heavy freezing rain",

        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",

        77: "Snow grains",

        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",

        85: "Slight snow showers",
        86: "Heavy snow showers",

        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    };

    return conditions[code] || "Unknown";
}


// Get weather icon
function getWeatherIcon(code) {
    if (code === 0) return "☀️";

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code === 45 || code === 48) {
        return "🌫️";
    }

    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {
        return "🌦️";
    }

    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67 ||
        code === 80 ||
        code === 81 ||
        code === 82
    ) {
        return "🌧️";
    }

    if (
        code === 71 ||
        code === 73 ||
        code === 75 ||
        code === 77 ||
        code === 85 ||
        code === 86
    ) {
        return "❄️";
    }

    if (code === 95 || code === 96 || code === 99) {
        return "⛈️";
    }

    return "🌤️";
}


/**
 * Fetch weather data from Open-Meteo
 */
async function getWeatherData(latitude, longitude) {

    const params = new URLSearchParams({

        latitude: latitude.toString(),

        longitude: longitude.toString(),

        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "sunshine_duration"
        ].join(","),

        timezone: "auto",

        forecast_days: "7"
    });


    const url =
        `${OPEN_METEO_URL}?${params.toString()}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `Open-Meteo API error: ${response.status} ${response.statusText}`
        );
    }


    const data =
        await response.json();


    /*
     * CURRENT WEATHER
     */
    const currentWeather = {

        temperature:
            data.current.temperature_2m,

        temperatureUnit:
            data.current_units.temperature_2m,

        humidity:
            data.current.relative_humidity_2m,

        humidityUnit:
            data.current_units.relative_humidity_2m,

        precipitation:
            data.current.precipitation,

        rain:
            data.current.rain,

        windSpeed:
            data.current.wind_speed_10m,

        windSpeedUnit:
            data.current_units.wind_speed_10m,

        weatherCode:
            data.current.weather_code,

        condition:
            getWeatherCondition(
                data.current.weather_code
            ),

        icon:
            getWeatherIcon(
                data.current.weather_code
            )
    };


    /*
     * 7-DAY FORECAST
     */
    const forecast =
        data.daily.time.map(
            (date, index) => {

                const sunshineSeconds =
                    data.daily.sunshine_duration?.[index] ??
                    null;


                const sunshineHours =
                    sunshineSeconds !== null
                        ? Number(
                            (
                                sunshineSeconds / 3600
                            ).toFixed(1)
                        )
                        : null;


                return {

                    date: date,

                    weatherCode:
                        data.daily.weather_code[index],

                    condition:
                        getWeatherCondition(
                            data.daily.weather_code[index]
                        ),

                    icon:
                        getWeatherIcon(
                            data.daily.weather_code[index]
                        ),

                    maxTemperature:
                        data.daily.temperature_2m_max[index],

                    minTemperature:
                        data.daily.temperature_2m_min[index],

                    rainfall:
                        data.daily.precipitation_sum[index],

                    rainProbability:
                        data.daily.precipitation_probability_max[index],

                    sunshineHours:
                        sunshineHours
                };
            }
        );


    /*
     * RETURN FINAL DATA
     */
    return {

        location: {

            latitude: latitude,

            longitude: longitude,

            timezone: data.timezone
        },


        /*
         * SOIL TYPE
         *
         * Temporary value for the dashboard.
         *
         * Later this can be replaced with:
         * - Farmer selected soil type
         * - Soil database
         * - Soil testing API
         */
        soilType: {

            value: "Loamy Soil",

            message:
                "Suitable for many crops"

        },


        current: currentWeather,

        forecast: forecast
    };
}


module.exports = {
    getWeatherData
};