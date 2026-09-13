import {
    useLanguage
} from "../../i18n/LanguageContext";


const languages = [
    {
        code: "en",
        name: "English"
    },
    {
        code: "ta",
        name: "தமிழ்"
    },
    {
        code: "hi",
        name: "हिन्दी"
    },
    {
        code: "te",
        name: "తెలుగు"
    },
    {
        code: "kn",
        name: "ಕನ್ನಡ"
    },
    {
        code: "ml",
        name: "മലയാളം"
    }
];


const LanguageSelector = () => {

    const {
        language,
        changeLanguage
    } = useLanguage();


    return (

        <div className="language-selector">

            <span className="language-icon">
                🌐
            </span>

            <select
                value={language}
                onChange={(event) =>
                    changeLanguage(
                        event.target.value
                    )
                }
                aria-label="Select language"
            >

                {languages.map(
                    (item) => (

                        <option
                            key={item.code}
                            value={item.code}
                        >

                            {item.name}

                        </option>

                    )
                )}

            </select>

        </div>
    );
};


export default LanguageSelector;
