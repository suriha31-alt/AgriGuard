import { useLanguage } from "../../i18n/LanguageContext";

const CurrentWeather = ({
    weather,
    forecast
}) => {
    const { t } = useLanguage();

    if (!weather) {
        return null;
    }

    const todaySunshine =
        forecast?.[0]?.sunshineHours;

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
                            {t.temperature}
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
                            {t.humidity}
                        </p>

                        <h2>
                            {weather.humidity}
                            <span>%</span>
                        </h2>

                        <p className="card-subtext">
                            {t.currentHumidity}
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
                            {t.sunlight}
                        </p>

                        <h2>
                            {todaySunshine !== null &&
                            todaySunshine !== undefined
                                ? todaySunshine
                                : "—"}

                            <span> hrs</span>
                        </h2>

                        <p className="card-subtext">
                            {t.expectedToday}
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
                            {t.rainfall}
                        </p>

                        <h2>
                            {todayRainfall ?? 0}
                            <span> mm</span>
                        </h2>

                        <p className="card-subtext">
                            {t.expectedToday}
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
                            {t.wind}
                        </p>

                        <h2>
                            {weather.windSpeed}
                            <span>
                                {" "}
                                {weather.windSpeedUnit}
                            </span>
                        </h2>

                        <p className="card-subtext">
                            {t.currentWind}
                        </p>
                    </div>
                </div>

            </div>

        </section>
    );
};

export default CurrentWeather;