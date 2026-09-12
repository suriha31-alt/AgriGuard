const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Fetch weather data from Open-Meteo
 * @param {number} latitude
 * @param {number} longitude
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
            "precipitation_probability_max"
        ].join(","),

        timezone: "auto",
        forecast_days: "7"
    });

    const url = `${OPEN_METEO_URL}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Open-Meteo API error: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    return data;
}

module.exports = {
    getWeatherData
};