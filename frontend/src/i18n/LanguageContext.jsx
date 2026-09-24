import {
    createContext,
    useContext,
    useState
} from "react";

import translations from "./translations";


const LanguageContext = createContext();


export const LanguageProvider = ({
    children
}) => {

    const savedLanguage =
        localStorage.getItem(
            "agriguard-language"
        ) || "en";


    const [language, setLanguage] =
        useState(savedLanguage);


    const changeLanguage = (
        newLanguage
    ) => {

        setLanguage(newLanguage);

        localStorage.setItem(
            "agriguard-language",
            newLanguage
        );
    };


    const t =
        translations[language] ||
        translations.en;


    return (

        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                t
            }}
        >

            {children}

        </LanguageContext.Provider>
    );
};


export const useLanguage = () => {

    return useContext(
        LanguageContext
    );

};