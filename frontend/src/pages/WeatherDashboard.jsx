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


import LanguageSelector
    from "../components/weather/LanguageSelector";


import {
    useLanguage
} from "../i18n/LanguageContext";



const WeatherDashboard = () => {

    /*
     * Language
     */
    const {
        t
    } = useLanguage();



    /*
     * Weather state
     */
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
                     * Get farmer location
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
                        {t.farmWeather}
                    </h2>


                    <p>

                        {locationLoading

                            ? t.detectingLocation

                            : t.fetchingWeather

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
                        {t.weatherUnavailable}
                    </h2>


                    <p>
                        {error}
                    </p>


                    <button
                        className="primary-button"
                        onClick={loadWeather}
                    >

                        🔄 {t.tryAgain}

                    </button>


                    <p className="location-help">

                        {t.locationPermission}

                    </p>

                </div>

            </div>
        );
    }



    /*
     * Safety check
     *
     * Prevents blank page if weather data
     * has not loaded correctly.
     */
    if (
        !weather ||
        !weather.current ||
        !weather.location
    ) {

        return (

            <div className="weather-page">

                <div className="weather-error">

                    <div className="error-icon">
                        ⚠️
                    </div>


                    <h2>
                        {t.weatherUnavailable}
                    </h2>


                    <button
                        className="primary-button"
                        onClick={loadWeather}
                    >

                        🔄 {t.tryAgain}

                    </button>

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


                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="weather-header">


                    {/* LEFT SIDE */}

                    <div className="header-left">

                        <div className="weather-logo">
                            🌤️
                        </div>


                        <div>

                            <p className="header-eyebrow">
                                {t.agriguard}
                            </p>


                            <h1>
                                {t.farmWeather}
                            </h1>


                            <p className="header-description">

                                {t.weatherDescription}

                            </p>

                        </div>

                    </div>



                    {/* RIGHT SIDE */}

                    <div className="header-right">


                        {/* LANGUAGE SELECTOR */}

                        <LanguageSelector />



                        {/* LOCATION */}

                        <div className="location-badge">

                            <span className="location-pin">
                                📍
                            </span>


                            <div>

                                <span>
                                    {t.farmLocation}
                                </span>


                                <strong>

                                    {weather.location.latitude.toFixed(4)}

                                    {" , "}

                                    {weather.location.longitude.toFixed(4)}

                                </strong>

                            </div>

                        </div>



                        {/* REFRESH BUTTON */}

                        <button
                            className="refresh-button"
                            onClick={loadWeather}
                            title={t.refresh}
                        >

                            <span>
                                🔄
                            </span>

                            {t.refresh}

                        </button>


                    </div>

                </header>



                {/* =========================================
                    STATUS BAR
                ========================================= */}

                <div className="weather-status-bar">


                    <div className="live-status">

                        <span className="live-dot"></span>

                        {t.liveWeather}

                    </div>



                    <div className="updated-time">

                        🕐 {t.lastUpdated}:{" "}


                        {lastUpdated

                            ? lastUpdated.toLocaleTimeString(

                                "en-IN",

                                {

                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit",

                                    second:
                                        "2-digit"

                                }

                            )

                            : "Just now"

                        }

                    </div>

                </div>



                {/* =========================================
                    CURRENT WEATHER CARDS
                ========================================= */}

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



                {/* =========================================
                    7 DAY FORECAST
                ========================================= */}

                <WeatherForecast

                    forecast={
                        weather.forecast
                    }

                />



                {/* =========================================
                    SMART FARMING ALERTS
                ========================================= */}

                <WeatherAlert

                    forecast={
                        weather.forecast
                    }

                />



                {/* =========================================
                    FOOTER
                ========================================= */}

                <footer className="weather-footer">


                    <div>

                        <strong>
                            {t.agriguard}
                        </strong>


                        <span>

                            {t.smartFarmingStarts}

                        </span>

                    </div>



                    <div className="data-source">

                        {t.poweredBy}

                    </div>


                </footer>


            </main>

        </div>
    );
};



export default WeatherDashboard;
