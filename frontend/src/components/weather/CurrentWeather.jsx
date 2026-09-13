const CurrentWeather = ({
    weather,
    soilType,
    forecast
}) => {

    if (!weather) {
        return null;
    }


    /*
     * Today's sunshine
     */
    const todaySunshine =
        forecast?.[0]?.sunshineHours;


    /*
     * Today's expected rainfall
     */
    const todayRainfall =
        forecast?.[0]?.rainfall;


    return (

        <section className="weather-cards-section">

            <div className="weather-cards-grid">


                {/* TEMPERATURE */}

                <div className="weather-card temperature-card">

                    <div className="card-icon">
                        🌡️
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Temperature
                        </p>

                        <h2>
                            {weather.temperature}
                            <span>°C</span>
                        </h2>

                        <p className="card-subtext">
                            {weather.condition}
                        </p>

                    </div>

                </div>



                {/* HUMIDITY */}

                <div className="weather-card humidity-card">

                    <div className="card-icon">
                        💧
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Humidity
                        </p>

                        <h2>
                            {weather.humidity}
                            <span>%</span>
                        </h2>

                        <p className="card-subtext">
                            Current humidity
                        </p>

                    </div>

                </div>



                {/* SOIL TYPE */}

                <div className="weather-card soil-card">

                    <div className="card-icon">
                        🌱
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Soil Type
                        </p>

                        <h2 className="soil-type-value">

                            {soilType?.value ||
                                "Not Available"}

                        </h2>

                        <p className="card-subtext">

                            {soilType?.message ||
                                "Soil information"}

                        </p>

                    </div>

                </div>



                {/* SUNLIGHT */}

                <div className="weather-card sunlight-card">

                    <div className="card-icon">
                        ☀️
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Sunlight
                        </p>

                        <h2>

                            {todaySunshine !== null &&
                            todaySunshine !== undefined
                                ? todaySunshine
                                : "—"}

                            <span> hrs</span>

                        </h2>

                        <p className="card-subtext">
                            Expected today
                        </p>

                    </div>

                </div>



                {/* RAINFALL */}

                <div className="weather-card rain-card">

                    <div className="card-icon">
                        🌧️
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Rainfall
                        </p>

                        <h2>

                            {todayRainfall ?? 0}

                            <span> mm</span>

                        </h2>

                        <p className="card-subtext">
                            Expected today
                        </p>

                    </div>

                </div>



                {/* WIND */}

                <div className="weather-card wind-card">

                    <div className="card-icon">
                        💨
                    </div>

                    <div className="card-content">

                        <p className="card-label">
                            Wind
                        </p>

                        <h2>

                            {weather.windSpeed}

                            <span>
                                {" "}
                                {weather.windSpeedUnit}
                            </span>

                        </h2>

                        <p className="card-subtext">
                            Current wind speed
                        </p>

                    </div>

                </div>


            </div>

        </section>
    );
};


export default CurrentWeather;