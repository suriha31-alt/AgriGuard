require("dotenv").config();

const {
    getSchemeRecommendations
} = require("./services/geminiService");

const farmer = {
    state: "Tamil Nadu",
    district: "Dindigul",
    land_size: "5.00",
    land_unit: "acres",
    crop_type: "Rice, Coconut, Banana",
    farming_type: "Crop farming"
};

async function testGemini() {

    try {

        console.log("Sending farmer information to Gemini...\n");

        const result = await getSchemeRecommendations(farmer);

        console.log("Gemini response:\n");
        console.log(result);

    } catch (error) {

        console.error("Gemini Error:");
        console.error(error);
    }
}

testGemini();