const API_URL =
    "http://localhost:5000/api/crop-recommendation/recommend";

export const getCropRecommendations = async (data) => {

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    });

    return await response.json();
};