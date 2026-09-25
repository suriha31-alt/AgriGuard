
import { useLanguage } from "../../i18n/LanguageContext";

const CurrentWeather = ({
    weather,
    forecast
}) => {

    const { language, t } = useLanguage();

    if (!weather) {
        return null;
    }

    const todaySunshine =
        forecast?.[0]?.sunshineHours;

    const todayRainfall =
        forecast?.[0]?.rainfall;


    /*
     * Weather condition translations
     */
    const conditionTranslations = {

        "Clear sky": {
            en: "Clear sky",
            ta: "தெளிவான வானம்",
            hi: "साफ आसमान",
            te: "స్పష్టమైన ఆకాశం",
            kn: "ಸ್ಪಷ್ಟವಾದ ಆಕಾಶ",
            ml: "തെളിഞ്ഞ ആകാശം"
        },

        "Mainly clear": {
            en: "Mainly clear",
            ta: "பெரும்பாலும் தெளிவு",
            hi: "मुख्यतः साफ",
            te: "ప్రధానంగా స్పష్టంగా",
            kn: "ಮುಖ್ಯವಾಗಿ ಸ್ಪಷ್ಟ",
            ml: "പ്രധാനമായും തെളിഞ്ഞത്"
        },

        "Partly cloudy": {
            en: "Partly cloudy",
            ta: "பகுதியளவு மேகமூட்டம்",
            hi: "आंशिक रूप से बादल",
            te: "పాక్షికంగా మేఘావృతం",
            kn: "ಭಾಗಶಃ ಮೋಡ",
            ml: "ഭാഗികമായി മേഘാവൃതം"
        },

        "Overcast": {
            en: "Overcast",
            ta: "முழுமையாக மேகமூட்டம்",
            hi: "बादलों से ढका",
            te: "పూర్తిగా మేఘావృతం",
            kn: "ಮೋಡದಿಂದ ಕೂಡಿದೆ",
            ml: "മേഘാവൃതം"
        },

        "Fog": {
            en: "Fog",
            ta: "மூடுபனி",
            hi: "कोहरा",
            te: "పొగమంచు",
            kn: "ಮಂಜು",
            ml: "മൂടൽമഞ്ഞ്"
        },

        "Light drizzle": {
            en: "Light drizzle",
            ta: "லேசான தூறல்",
            hi: "हल्की बूंदाबांदी",
            te: "తేలికపాటి జల్లులు",
            kn: "ಲಘು ತುಂತುರು ಮಳೆ",
            ml: "നേരിയ ചാറ്റൽമഴ"
        },

        "Moderate drizzle": {
            en: "Moderate drizzle",
            ta: "மிதமான தூறல்",
            hi: "मध्यम बूंदाबांदी",
            te: "మోస్తరు జల్లులు",
            kn: "ಮಧ್ಯಮ ತುಂತುರು ಮಳೆ",
            ml: "മിതമായ ചാറ്റൽമഴ"
        },

        "Dense drizzle": {
            en: "Dense drizzle",
            ta: "அடர்த்தியான தூறல்",
            hi: "घनी बूंदाबांदी",
            te: "దట్టమైన జల్లులు",
            kn: "ದಟ್ಟವಾದ ತುಂತುರು ಮಳೆ",
            ml: "കനത്ത ചാറ്റൽമഴ"
        },

        "Slight rain": {
            en: "Slight rain",
            ta: "லேசான மழை",
            hi: "हल्की बारिश",
            te: "తేలికపాటి వర్షం",
            kn: "ಲಘು ಮಳೆ",
            ml: "നേരിയ മഴ"
        },

        "Moderate rain": {
            en: "Moderate rain",
            ta: "மிதமான மழை",
            hi: "मध्यम बारिश",
            te: "మోస్తరు వర్షం",
            kn: "ಮಧ್ಯಮ ಮಳೆ",
            ml: "മിതമായ മഴ"
        },

        "Heavy rain": {
            en: "Heavy rain",
            ta: "கனமழை",
            hi: "भारी बारिश",
            te: "భారీ వర్షం",
            kn: "ಭಾರಿ ಮಳೆ",
            ml: "കനത്ത മഴ"
        },

        "Thunderstorm": {
            en: "Thunderstorm",
            ta: "இடியுடன் கூடிய மழை",
            hi: "आंधी-तूफान",
            te: "ఉరుములతో కూడిన వర్షం",
            kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
            ml: "ഇടിമിന്നലോടുകൂടിയ മഴ"
        }
    };


    const translatedCondition =
        conditionTranslations[
            weather.condition
        ]?.[language] ||
        weather.condition;


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
                            {translatedCondition}
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
