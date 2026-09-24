const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function getSchemeRecommendations(farmer) {

    const prompt = `
You are the Government Scheme Recommendation Engine for AgriGuard,
an agriculture assistance application for farmers in India.

FARMER INFORMATION:

State: ${farmer.state}
District: ${farmer.district}
Land Size: ${farmer.land_size} ${farmer.land_unit}
Crops: ${farmer.crop_type}
Farming Type: ${farmer.farming_type}

TASK:

Identify government schemes that may be relevant to this farmer.

IMPORTANT RULES:

1. Focus specifically on government schemes available to farmers in India.
2. Consider the farmer's state, district, crops, land size and farming type.
3. Do not invent schemes.
4. Do not invent eligibility criteria.
5. Do not invent benefits.
6. Do not invent application URLs.
7. Only provide an application URL if you are confident that it is an official government URL.
8. If you are not confident about the official application URL, return null.
9. Prefer official government domains such as:
   - gov.in
   - nic.in
   - official state government domains
10. Do not mention Gemini, AI, API, prompts or internal processing.
11. Return ONLY valid JSON.
12. Do not use Markdown.
13. Return the most relevant schemes rather than an unnecessarily large list.
14. If there are no suitable schemes, return an empty array.
15. Do not claim that a farmer is definitely eligible. Describe eligibility requirements instead.

RETURN EXACTLY THIS JSON FORMAT:

{
  "schemes": [
    {
      "scheme_name": "Scheme name",
      "description": "Short description",
      "benefits": [
        "Benefit 1",
        "Benefit 2"
      ],
      "eligibility": [
        "Eligibility requirement 1",
        "Eligibility requirement 2"
      ],
      "state": "State or All India",
      "application_url": null
    }
  ]
}
`;

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            console.log(
                `Gemini request attempt ${attempt}/${maxAttempts}...`
            );

            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt
            });

            return response.text;

        } catch (error) {

            console.error(
                `Gemini request failed on attempt ${attempt}:`,
                error.status || error.message
            );

            // Retry only temporary server errors
            if (error.status === 503 && attempt < maxAttempts) {

                const delay = 2000 * Math.pow(2, attempt - 1);

                console.log(
                    `Gemini is temporarily unavailable. ` +
                    `Retrying in ${delay / 1000} seconds...`
                );

                await new Promise(resolve =>
                    setTimeout(resolve, delay)
                );

            } else {

                throw error;
            }
        }
    }
}

module.exports = {
    getSchemeRecommendations
};