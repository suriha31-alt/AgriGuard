import axios from "axios";


const API_URL =
    "http://localhost:5000/api/weather";


export const fetchWeather = async (
    latitude,
    longitude
) => {

    try {

        const response =
            await axios.get(
                API_URL,
                {
                    params: {
                        lat: latitude,
                        lon: longitude
                    }
                }
            );


        return response.data;


    } catch (error) {

        console.error(
            "Weather API Error:",
            error
        );

        throw error;
    }
};