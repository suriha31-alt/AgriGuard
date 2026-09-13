const WeatherAlert = ({
    forecast
}) => {

    if (
        !forecast ||
        forecast.length === 0
    ) {
        return null;
    }


    const alerts = [];


    /*
     * Check heavy rain
     */
    const heavyRainDay =
        forecast.find(
            (day) =>
                day.rainfall >= 5
        );


    if (heavyRainDay) {

        alerts.push({

            type: "rain",

            icon: "🌧️",

            title:
                "Heavy Rain Expected",

            message:
                `Around ${heavyRainDay.rainfall} mm of rainfall may occur on ${formatDate(
                    heavyRainDay.date
                )}. Avoid unnecessary irrigation and check field drainage.`

        });
    }


    /*
     * Check high rain probability
     */
    const highRainDay =
        forecast.find(
            (day) =>
                day.rainProbability >= 80
        );


    if (highRainDay) {

        alerts.push({

            type: "warning",

            icon: "⚠️",

            title:
                "High Rain Probability",

            message:
                `There is a ${highRainDay.rainProbability}% chance of rain on ${formatDate(
                    highRainDay.date
                )}. Plan irrigation and outdoor farm work accordingly.`

        });
    }


    /*
     * Spraying advisory
     */
    if (highRainDay) {

        alerts.push({

            type: "spraying",

            icon: "🚜",

            title:
                "Spraying Advisory",

            message:
                "Avoid spraying pesticides or foliar fertilizers immediately before expected rainfall to reduce wash-off and wastage."

        });
    }


    /*
     * High temperature warning
     */
    const hotDay =
        forecast.find(
            (day) =>
                day.maxTemperature >= 38
        );


    if (hotDay) {

        alerts.push({

            type: "heat",

            icon: "🌡️",

            title:
                "High Temperature",

            message:
                `Temperature may reach ${hotDay.maxTemperature}°C on ${formatDate(
                    hotDay.date
                )}. Monitor crops for heat stress and plan irrigation carefully.`

        });
    }


    /*
     * If there are no alerts
     */
    if (alerts.length === 0) {

        return (

            <section className="alerts-section">

                <div className="alert success-alert">

                    <div className="alert-icon">
                        ✅
                    </div>

                    <div>

                        <h3>
                            Weather Looks Favorable
                        </h3>

                        <p>
                            No major weather risks detected
                            in the current 7-day forecast.
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    return (

        <section className="alerts-section">

            <div className="section-heading">

                <div>

                    <p className="section-eyebrow">
                        FARM INTELLIGENCE
                    </p>

                    <h2>
                        Smart Farming Alerts
                    </h2>

                </div>

            </div>


            <div className="alerts-list">

                {alerts.map(
                    (alert, index) => (

                        <div
                            className={
                                `smart-alert ${alert.type}`
                            }
                            key={index}
                        >

                            <div className="alert-icon">
                                {alert.icon}
                            </div>

                            <div className="alert-content">

                                <h3>
                                    {alert.title}
                                </h3>

                                <p>
                                    {alert.message}
                                </p>

                            </div>

                        </div>

                    )
                )}

            </div>

        </section>
    );
};


/*
 * Format date
 */
function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "short"
        }
    );
}


export default WeatherAlert;