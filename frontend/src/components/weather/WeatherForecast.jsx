const WeatherForecast = ({
    forecast
}) => {

    if (
        !forecast ||
        forecast.length === 0
    ) {
        return null;
    }


    return (

        <section className="forecast-section">

            <div className="section-heading">

                <div>

                    <p className="section-eyebrow">
                        WEATHER OUTLOOK
                    </p>

                    <h2>
                        7-Day Forecast
                    </h2>

                </div>

                <span className="forecast-note">
                    Plan your farm activities
                </span>

            </div>


            <div className="forecast-grid">

                {forecast.map(
                    (day, index) => {

                        const date =
                            new Date(
                                `${day.date}T00:00:00`
                            );


                        const dayName =
                            date.toLocaleDateString(
                                "en-IN",
                                {
                                    weekday:
                                        "short"
                                }
                            );


                        const dayDate =
                            date.toLocaleDateString(
                                "en-IN",
                                {
                                    day:
                                        "numeric",
                                    month:
                                        "short"
                                }
                            );


                        return (

                            <div
                                className={
                                    `forecast-card ${
                                        index === 0
                                            ? "today"
                                            : ""
                                    }`
                                }
                                key={day.date}
                            >

                                {index === 0 && (

                                    <div className="today-badge">
                                        TODAY
                                    </div>

                                )}


                                <div className="forecast-date">

                                    <strong>
                                        {dayName}
                                    </strong>

                                    <span>
                                        {dayDate}
                                    </span>

                                </div>


                                <div className="forecast-weather-icon">

                                    {day.icon ||
                                        "🌤️"}

                                </div>


                                <p className="forecast-condition">

                                    {day.condition}

                                </p>


                                <div className="forecast-temperature">

                                    <strong>
                                        {day.maxTemperature}°
                                    </strong>

                                    <span>
                                        {day.minTemperature}°
                                    </span>

                                </div>


                                <div className="forecast-info">

                                    <div>

                                        <span>
                                            🌧️
                                        </span>

                                        <p>
                                            Rain
                                        </p>

                                        <strong>
                                            {
                                                day.rainProbability
                                            }%
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            💧
                                        </span>

                                        <p>
                                            Amount
                                        </p>

                                        <strong>
                                            {day.rainfall}
                                            {" "}mm
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            ☀️
                                        </span>

                                        <p>
                                            Sun
                                        </p>

                                        <strong>
                                            {day.sunshineHours ??
                                                "—"}
                                            {" "}hrs
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        );
                    }
                )}

            </div>

        </section>
    );
};


export default WeatherForecast;