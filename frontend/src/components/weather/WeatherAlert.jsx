import { useLanguage } from "../../i18n/LanguageContext";


const WeatherAlert = ({
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

            title: t.heavyRain,

            message:
                getHeavyRainMessage(
                    heavyRainDay,
                    language
                )

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
                t.highRainProbability,

            message:
                getHighRainMessage(
                    highRainDay,
                    language
                )

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
                t.sprayingAdvisory,

            message:
                getSprayingMessage(language)

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
                t.highTemperature,

            message:
                getHeatMessage(
                    hotDay,
                    language
                )

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
                            {t.favorableWeather}
                        </h3>

                        <p>
                            {t.noMajorRisks}
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
                        {t.farmIntelligence}
                    </p>

                    <h2>
                        {t.smartFarmingAlerts}
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
 * Heavy rain message
 */
function getHeavyRainMessage(
    day,
    language
) {

    const date =
        formatDate(
            day.date,
            language
        );


    const messages = {

        en:
            `Around ${day.rainfall} mm of rainfall may occur on ${date}. Avoid unnecessary irrigation and check field drainage.`,

        ta:
            `${date} அன்று சுமார் ${day.rainfall} மிமீ மழைப்பொழிவு ஏற்படலாம். தேவையற்ற பாசனத்தைத் தவிர்த்து, வயல் வடிகால் வசதியை சரிபார்க்கவும்.`,

        hi:
            `${date} को लगभग ${day.rainfall} मिमी बारिश हो सकती है। अनावश्यक सिंचाई से बचें और खेत की जल निकासी की जांच करें।`,

        te:
            `${date} నాడు సుమారు ${day.rainfall} మిమీ వర్షపాతం నమోదయ్యే అవకాశం ఉంది. అవసరం లేని నీటిపారుదలను నివారించి, పొలం నీటి పారుదలను తనిఖీ చేయండి.`,

        kn:
            `${date} ರಂದು ಸುಮಾರು ${day.rainfall} ಮಿಮೀ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಅನಗತ್ಯ ನೀರಾವರಿಯನ್ನು ತಪ್ಪಿಸಿ ಮತ್ತು ಹೊಲದ ನೀರು ಹರಿವಿನ ವ್ಯವಸ್ಥೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.`,

        ml:
            `${date} ഏകദേശം ${day.rainfall} മിമീ മഴ ലഭിക്കാൻ സാധ്യതയുണ്ട്. അനാവശ്യ ജലസേചനം ഒഴിവാക്കി കൃഷിയിടത്തിലെ വെള്ളം ഒഴുകിപ്പോകുന്ന സംവിധാനം പരിശോധിക്കുക.`
    };


    return messages[language] || messages.en;
}


/*
 * High rain probability message
 */
function getHighRainMessage(
    day,
    language
) {

    const date =
        formatDate(
            day.date,
            language
        );


    const messages = {

        en:
            `There is a ${day.rainProbability}% chance of rain on ${date}. Plan irrigation and outdoor farm work accordingly.`,

        ta:
            `${date} அன்று மழை பெய்ய ${day.rainProbability}% வாய்ப்பு உள்ளது. அதற்கேற்ப பாசனம் மற்றும் வெளிப்புற விவசாய பணிகளை திட்டமிடுங்கள்.`,

        hi:
            `${date} को बारिश की ${day.rainProbability}% संभावना है। उसी के अनुसार सिंचाई और खेत के बाहरी कार्यों की योजना बनाएं।`,

        te:
            `${date} నాడు వర్షం పడే అవకాశం ${day.rainProbability}% ఉంది. అందుకు అనుగుణంగా నీటిపారుదల మరియు బహిరంగ వ్యవసాయ పనులను ప్రణాళిక చేసుకోండి.`,

        kn:
            `${date} ರಂದು ಮಳೆಯಾಗುವ ${day.rainProbability}% ಸಾಧ್ಯತೆಯಿದೆ. ಅದಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಮತ್ತು ಹೊರಾಂಗಣ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಯೋಜಿಸಿ.`,

        ml:
            `${date} മഴയ്ക്ക് ${day.rainProbability}% സാധ്യതയുണ്ട്. അതനുസരിച്ച് ജലസേചനവും പുറം കൃഷി പ്രവർത്തനങ്ങളും ആസൂത്രണം ചെയ്യുക.`
    };


    return messages[language] || messages.en;
}


/*
 * Spraying advisory message
 */
function getSprayingMessage(
    language
) {

    const messages = {

        en:
            "Avoid spraying pesticides or foliar fertilizers immediately before expected rainfall to reduce wash-off and wastage.",

        ta:
            "எதிர்பார்க்கப்படும் மழைக்கு முன்பாக பூச்சிக்கொல்லிகள் அல்லது இலைவழி உரங்களை தெளிப்பதைத் தவிர்க்கவும். இதனால் மருந்து கழுவிச் செல்வதையும் வீணாவதையும் குறைக்கலாம்.",

        hi:
            "अपेक्षित बारिश से ठीक पहले कीटनाशकों या पत्तियों पर दिए जाने वाले उर्वरकों का छिड़काव न करें। इससे दवा के बह जाने और बर्बादी को कम किया जा सकता है।",

        te:
            "వర్షం వచ్చే ముందు వెంటనే పురుగుమందులు లేదా ఆకులపై పిచికారీ చేసే ఎరువులను ఉపయోగించవద్దు. ఇలా చేయడం వల్ల మందు కొట్టుకుపోవడం మరియు వృథా తగ్గుతుంది.",

        kn:
            "ನಿರೀಕ್ಷಿತ ಮಳೆಯ ಮೊದಲು ಕೀಟನಾಶಕಗಳು ಅಥವಾ ಎಲೆಗಳ ಗೊಬ್ಬರಗಳನ್ನು ಸಿಂಪಡಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ. ಇದರಿಂದ ಔಷಧಿ ಕೊಚ್ಚಿಹೋಗುವುದು ಮತ್ತು ವ್ಯರ್ಥವಾಗುವುದನ್ನು ಕಡಿಮೆ ಮಾಡಬಹುದು.",

        ml:
            "പ്രതീക്ഷിക്കുന്ന മഴയ്ക്ക് തൊട്ടുമുമ്പ് കീടനാശിനികളോ ഇലകളിൽ തളിക്കുന്ന വളങ്ങളോ പ്രയോഗിക്കുന്നത് ഒഴിവാക്കുക. ഇത് മരുന്ന് ഒലിച്ചുപോകുന്നതും പാഴാകുന്നതും കുറയ്ക്കാൻ സഹായിക്കും."
    };


    return messages[language] || messages.en;
}


/*
 * High temperature message
 */
function getHeatMessage(
    day,
    language
) {

    const date =
        formatDate(
            day.date,
            language
        );


    const messages = {

        en:
            `Temperature may reach ${day.maxTemperature}°C on ${date}. Monitor crops for heat stress and plan irrigation carefully.`,

        ta:
            `${date} அன்று வெப்பநிலை ${day.maxTemperature}°C வரை உயரக்கூடும். பயிர்களில் வெப்ப அழுத்தத்தை கண்காணித்து, பாசனத்தை கவனமாக திட்டமிடுங்கள்.`,

        hi:
            `${date} को तापमान ${day.maxTemperature}°C तक पहुंच सकता है। फसलों में गर्मी के तनाव की निगरानी करें और सिंचाई की सावधानीपूर्वक योजना बनाएं।`,

        te:
            `${date} నాడు ఉష్ణోగ్రత ${day.maxTemperature}°C వరకు చేరవచ్చు. పంటల్లో వేడి ఒత్తిడిని గమనించి, నీటిపారుదలను జాగ్రత్తగా ప్రణాళిక చేసుకోండి.`,

        kn:
            `${date} ರಂದು ತಾಪಮಾನ ${day.maxTemperature}°C ವರೆಗೆ ಏರಬಹುದು. ಬೆಳೆಗಳಲ್ಲಿ ಉಷ್ಣ ಒತ್ತಡವನ್ನು ಗಮನಿಸಿ ಮತ್ತು ನೀರಾವರಿಯನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಯೋಜಿಸಿ.`,

        ml:
            `${date} താപനില ${day.maxTemperature}°C വരെ ഉയരാൻ സാധ്യതയുണ്ട്. വിളകളിലെ ചൂട് സമ്മർദ്ദം നിരീക്ഷിക്കുകയും ജലസേചനം ശ്രദ്ധാപൂർവ്വം ആസൂത്രണം ചെയ്യുകയും ചെയ്യുക.`
    };


    return messages[language] || messages.en;
}


/*
 * Format date according to selected language
 */
function formatDate(
    dateString,
    language
) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    const localeMap = {

        en: "en-IN",

        ta: "ta-IN",

        hi: "hi-IN",

        te: "te-IN",

        kn: "kn-IN",

        ml: "ml-IN"
    };


    return date.toLocaleDateString(
        localeMap[language] || "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "short"
        }
    );
}


export default WeatherAlert;
