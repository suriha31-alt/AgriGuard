require("dotenv").config();

const {
    getSchemeRecommendations
} = require("./services/aiService");


const farmer = {
    state: "Tamil Nadu",
    district: "Dindigul",
    land_size: "5.00",
    land_unit: "acres",
    crop_type: "Rice, Coconut, Banana",
    farming_type: "Crop farming"
};


async function testAI() {

    try {

        console.log(
            "Sending farmer information to OpenRouter...\n"
        );

        const result =
            await getSchemeRecommendations(farmer);

        console.log("OpenRouter response:\n");
        console.log(result);

    } catch (error) {

        console.error("OpenRouter Error:");
        console.error(error);
    }
}


testAI();