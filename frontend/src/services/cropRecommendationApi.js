const API_BASE_URL = "http://localhost:5000/api";

export const getCropRecommendations = async (input) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/crop-recommendation/recommend`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(input)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to get crop recommendations"
            );
        }

        return data;

    } catch (error) {
        console.error(
            "Crop Recommendation API Error:",
            error
        );

        throw error;
    }
};