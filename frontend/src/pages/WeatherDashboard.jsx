```jsx
import {
    useCallback,
    useEffect,
    useState
} from "react";


import {
    fetchWeather
} from "../services/weatherApi";


import CurrentWeather
    from "../components/weather/CurrentWeather";


import WeatherForecast
    from "../components/weather/WeatherForecast";


import WeatherAlert
    from "../components/weather/WeatherAlert";



const WeatherDashboard = () => {

    const [weather, setWeather] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState(null);


    const [lastUpdated, setLastUpdated] =
        useState(null);


    const [locationLoading, setLocationLoading] =
        useState(true);



    /*
     * Get farmer's current location
     */
    const getFarmerLocation =
        () => {

            return new Promise(
                (resolve, reject) => {

                    if (
                        !navigator.geolocation
                    ) {

                        reject(
                            new Error(
                                "Geolocation is not supported by this browser."
                            )
                        );

                        return;
                    }


                    navigator.geolocation.getCurrentPosition(

                        (position) => {

                            resolve({

                                latitude:
                                    position.coords.latitude,

                                longitude:
                                    position.coords.longitude

                            });
                        },


                        (error) => {

                            let message =
                                "Unable to get your location.";


                            switch (
                                error.code
                            ) {

                                case error.PERMISSION_DENIED:

                                    message =
                                        "Location permission was denied. Please allow location access to view weather for your farm.";

                                    break;


                                case error.POSITION_UNAVAILABLE:

                                    message =
                                        "Your current location is unavailable.";

                                    break;


                                case error.TIMEOUT:

                                    message =
                                        "Location request timed out. Please try again.";

                                    break;


                                default:

                                    message =
                                        "Unable to determine your location.";
                            }


                            reject(
                                new Error(message)
                            );
                        },


                        {
                            enableHighAccuracy:
                                true,

                            timeout:
                                10000,

                            maximumAge:
                                300000
                        }
                    );
                }
            );
        };



    /*
     * Load weather
     */
    const loadWeather =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setLocationLoading(true);

                    setError(null);


                    /*
                     * Get current farmer location
                     */
                    const location =
                        await getFarmerLocation();


                    setLocationLoading(false);


                    /*
                     * Fetch weather
                     */
                    const response =
                        await fetchWeather(

                            location.latitude,

                            location.longitude
                        );


                    if (
                        !response.success
                    ) {

                        throw new Error(
                            response.message ||
                            "Weather data unavailable."
                        );
                    }


                    setWeather(
                        response.data
                    );


                    setLastUpdated(
                        new Date()
                    );


                } catch (err) {

                    console.error(
                        "Weather Error:",
                        err
                    );


                    setError(
                        err.message ||
                        "Unable to load weather information."
                    );


                } finally {

                    setLoading(false);

                    setLocationLoading(false);
                }

            },
            []
        );



    /*
     * Load weather when page opens
     */
    useEffect(() => {

        loadWeather();

    }, [loadWeather]);



    /*
     * Loading screen
     */
    if (loading) {

        return (

            <div className="weather-page">

                <div className="weather-loading">

                    <div className="loading-animation">
                        🌤️
                    </div>

                    <h2>
                        Getting your farm weather
                    </h2>

                    <p>

                        {locationLoading

                            ? "Detecting your location..."

                            : "Fetching the latest weather information..."

                        }

                    </p>

                    <div className="loading-bar">

                        <div></div>

                    </div>

                </div>

            </div>
        );
    }



    /*
     * Error screen
     */
    if (error) {

        return (

            <div className="weather-page">

                <div className="weather-error">

                    <div className="error-icon">
                        📍
                    </div>

                    <h2>
                        Weather unavailable
                    </h2>

                    <p>
                        {error}
                    </p>


                    <button
                        className="primary-button"
                        onClick={loadWeather}
                    >

                        🔄 Try Again

                    </button>


                    <p className="location-help">

                        Make sure location permission
                        is enabled in your browser.

                    </p>

                </div>

            </div>
        );
    }



    /*
     * Main dashboard
     */
    return (

        <div className="weather-page">

            <main className="weather-dashboard">


                {/* HEADER */}

                <header className="weather-header">

                    <div className="header-left">

                        <div className="weather-logo">
                            🌤️
                        </div>

                        <div>

                            <p className="header-eyebrow">
                                AGRIGUARD
                            </p>

                            <h1>
                                Farm Weather
                            </h1>

                            <p className="header-description">

                                Smart weather insights
                                for better farming decisions

                            </p>

                        </div>

                    </div>


                    <div className="header-right">

                        <div className="location-badge">

                            <span className="location-pin">
                                📍
                            </span>

                            <div>

                                <span>
                                    Your farm location
                                </span>

                                <strong>

                                    {weather.location.latitude.toFixed(4)}

                                    {" , "}

                                    {weather.location.longitude.toFixed(4)}

                                </strong>

                            </div>

                        </div>


                        <button
                            className="refresh-button"
                            onClick={loadWeather}
                            title="Refresh weather"
                        >

                            <span>
                                🔄
                            </span>

                            Refresh

                        </button>

                    </div>

                </header>



                {/* STATUS BAR */}

                <div className="weather-status-bar">

                    <div className="live-status">

                        <span className="live-dot"></span>

                        Live weather data

                    </div>


                    <div className="updated-time">

                        🕐 Last updated:{" "}

                        {lastUpdated

                            ? lastUpdated.toLocaleTimeString(

                                "en-IN",

                                {

                                    hour: "2-digit",

                                    minute: "2-digit",

                                    second: "2-digit"

                                }

                            )

                            : "Just now"

                        }

                    </div>

                </div>



                {/* CURRENT WEATHER */}

                <CurrentWeather

                    weather={
                        weather.current
                    }

                    soilType={
                        weather.soilType
                    }

                    forecast={
                        weather.forecast
                    }

                />



                {/* FORECAST */}

                <WeatherForecast

                    forecast={
                        weather.forecast
                    }

                />



                {/* ALERTS */}

                <WeatherAlert

                    forecast={
                        weather.forecast
                    }

                />



                {/* FOOTER */}

                <footer className="weather-footer">

                    <div>

                        <strong>
                            AgriGuard
                        </strong>

                        <span>

                            Smart farming starts
                            with better information.

                        </span>

                    </div>


                    <div className="data-source">

                        Weather data powered by
                        Open-Meteo

                    </div>

                </footer>


            </main>

        </div>
    );
};


export default WeatherDashboard;
```
