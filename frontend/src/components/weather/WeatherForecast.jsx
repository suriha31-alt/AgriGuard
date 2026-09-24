
import { useLanguage } from "../../i18n/LanguageContext";


const WeatherForecast = ({
    forecast
}) => {

    const {
        language,
        t
    } = useLanguage();


    if (
        !forecast ||
        forecast.length === 0
    ) {
        return null;
    }


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
            hi: "तेज बूंदाबांदी",
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

        "Slight rain showers": {
            en: "Slight rain showers",
            ta: "லேசான மழைத்தூறல்",
            hi: "हल्की बारिश की बौछार",
            te: "తేలికపాటి వర్షపు జల్లులు",
            kn: "ಲಘು ಮಳೆಯ ತುಂತುರು",
            ml: "നേരിയ മഴച്ചാറ്റൽ"
        },

        "Moderate rain showers": {
            en: "Moderate rain showers",
            ta: "மிதமான மழைத்தூறல்",
            hi: "मध्यम बारिश की बौछार",
            te: "మోస్తరు వర్షపు జల్లులు",
            kn: "ಮಧ್ಯಮ ಮಳೆಯ ತುಂತುರು",
            ml: "മിതമായ മഴച്ചാറ്റൽ"
        },

        "Heavy rain showers": {
            en: "Heavy rain showers",
            ta: "கனமான மழைத்தூறல்",
            hi: "तेज बारिश की बौछार",
            te: "భారీ వర్షపు జల్లులు",
            kn: "ಭಾರಿ ಮಳೆಯ ತುಂತುರು",
            ml: "കനത്ത മഴച്ചാറ്റൽ"
        },

        "Thunderstorm": {
            en: "Thunderstorm",
            ta: "இடியுடன் கூடிய மழை",
            hi: "आंधी-तूफान",
            te: "ఉరుములతో కూడిన వర్షం",
            kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
            ml: "ഇടിമിന്നലോടുകൂടിയ മഴ"
        },

        "Thunderstorm with slight hail": {
            en: "Thunderstorm with slight hail",
            ta: "லேசான ஆலங்கட்டி மழையுடன் இடியுடன் கூடிய மழை",
            hi: "हल्की ओलावृष्टि के साथ आंधी",
            te: "తేలికపాటి వడగళ్లతో ఉరుములతో కూడిన వర్షం",
            kn: "ಲಘು ಆಲಿಕಲ್ಲಿನೊಂದಿಗೆ ಗುಡುಗು ಸಹಿತ ಮಳೆ",
            ml: "നേരിയ ആലിപ്പഴത്തോടുകൂടിയ ഇടിമിന്നൽ"
        },

        "Thunderstorm with heavy hail": {
            en: "Thunderstorm with heavy hail",
            ta: "கனமான ஆலங்கட்டி மழையுடன் இடியுடன் கூடிய மழை",
            hi: "भारी ओलावृष्टि के साथ आंधी",
            te: "భారీ వడగళ్లతో ఉరుములతో కూడిన వర్షం",
            kn: "ಭಾರಿ ಆಲಿಕಲ್ಲಿನೊಂದಿಗೆ ಗುಡುಗು ಸಹಿತ ಮಳೆ",
            ml: "കനത്ത ആലിപ്പഴത്തോടുകൂടിയ ഇടിമിന്നൽ"
        }
    };


    /*
     * Translate weather condition
     */
    const getTranslatedCondition = (
        condition
    ) => {

        return (
            conditionTranslations[
                condition
            ]?.[language] ||
            condition
        );
    };


    /*
     * Locale for dates
     */
    const localeMap = {

        en: "en-IN",
        ta: "ta-IN",
        hi: "hi-IN",
        te: "te-IN",
        kn: "kn-IN",
        ml: "ml-IN"

    };


    return (

        <section className="forecast-section">


            {/* SECTION HEADER */}

            <div className="section-heading">

                <div>

                    <p className="section-eyebrow">
                        {t.weatherOutlook}
                    </p>

                    <h2>
                        {t.sevenDayForecast}
                    </h2>

                </div>


                <span className="forecast-note">
                    {t.planFarmActivities}
                </span>

            </div>



            {/* FORECAST CARDS */}

            <div className="forecast-grid">

                {forecast.map(
                    (day, index) => {

                        const date =
                            new Date(
                                `${day.date}T00:00:00`
                            );


                        const dayName =
                            date.toLocaleDateString(
                                localeMap[language] ||
                                "en-IN",
                                {
                                    weekday: "short"
                                }
                            );


                        const dayDate =
                            date.toLocaleDateString(
                                localeMap[language] ||
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "short"
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


                                {/* TODAY BADGE */}

                                {index === 0 && (

                                    <div className="today-badge">

                                        {t.today}

                                    </div>

                                )}



                                {/* DATE */}

                                <div className="forecast-date">

                                    <strong>
                                        {dayName}
                                    </strong>

                                    <span>
                                        {dayDate}
                                    </span>

                                </div>



                                {/* WEATHER ICON */}

                                <div className="forecast-weather-icon">

                                    {day.icon ||
                                        "🌤️"}

                                </div>



                                {/* CONDITION */}

                                <p className="forecast-condition">

                                    {getTranslatedCondition(
                                        day.condition
                                    )}

                                </p>



                                {/* TEMPERATURE */}

                                <div className="forecast-temperature">

                                    <strong>
                                        {day.maxTemperature}°
                                    </strong>

                                    <span>
                                        {day.minTemperature}°
                                    </span>

                                </div>



                                {/* FORECAST INFORMATION */}

                                <div className="forecast-info">


                                    {/* RAIN PROBABILITY */}

                                    <div>

                                        <span>
                                            🌧️
                                        </span>

                                        <p>
                                            {t.rain}
                                        </p>

                                        <strong>
                                            {
                                                day.rainProbability
                                            }%
                                        </strong>

                                    </div>



                                    {/* RAIN AMOUNT */}

                                    <div>

                                        <span>
                                            💧
                                        </span>

                                        <p>
                                            {t.amount}
                                        </p>

                                        <strong>

                                            {day.rainfall}
                                            {" "}mm

                                        </strong>

                                    </div>



                                    {/* SUNSHINE */}

                                    <div>

                                        <span>
                                            ☀️
                                        </span>

                                        <p>
                                            {t.sun}
                                        </p>

                                        <strong>

                                            {
                                                day.sunshineHours ??
                                                "—"
                                            }

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