const https = require("https");

function callOpenRouter(messages) {
    return new Promise((resolve, reject) => {

        const requestData = JSON.stringify({
            model: "openrouter/free",
            messages: messages,
            temperature: 0.2
        });

        const options = {
            hostname: "openrouter.ai",
            path: "/api/v1/chat/completions",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestData)
            }
        };

        const req = https.request(options, (res) => {

            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {

                if (res.statusCode < 200 || res.statusCode >= 300) {

                    console.error(
                        "OpenRouter API Error:",
                        res.statusCode,
                        body
                    );

                    return reject(
                        new Error(
                            `OpenRouter API returned status ${res.statusCode}`
                        )
                    );
                }

                try {

                    const data = JSON.parse(body);

                    const content =
                        data?.choices?.[0]?.message?.content;

                    if (!content) {
                        return reject(
                            new Error(
                                "OpenRouter returned an empty response"
                            )
                        );
                    }

                    resolve(content);

                } catch (error) {

                    reject(
                        new Error(
                            "Failed to parse OpenRouter response"
                        )
                    );
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(requestData);
        req.end();
    });
}


async function getSchemeRecommendations(farmer) {

    const prompt = `
You are the Government Scheme Recommendation Engine
for AgriGuard, an agriculture assistance application
for farmers in India.

FARMER INFORMATION:

State: ${farmer.state}
District: ${farmer.district}
Land Size: ${farmer.land_size} ${farmer.land_unit}
Crops: ${farmer.crop_type}
Farming Type: ${farmer.farming_type}

TASK:

Identify government schemes that may be relevant to this farmer.

IMPORTANT RULES:

1. Focus only on government schemes available to farmers in India.

2. Consider:
   - State
   - District
   - Land size
   - Crops
   - Farming type

3. Do not invent government schemes.

4. Do not invent eligibility requirements.

5. Do not invent benefits.

6. Do not invent application URLs.

7. Only provide an application URL when you are confident
   that it belongs to an official government website.

8. If an official application URL cannot be confidently
   identified, return null.

9. Prefer official government domains such as:
   - gov.in
   - nic.in
   - official state government domains

10. Do not mention AI, OpenRouter, models, prompts,
    APIs or internal processing.

11. Return ONLY valid JSON.

12. Do not use Markdown.

13. Return the most relevant schemes.

14. Do not return an unnecessarily large list.

15. Do not claim that the farmer is definitely eligible.
    Instead, describe the eligibility requirements.

16. If no relevant schemes can be identified,
    return an empty schemes array.

RETURN EXACTLY THIS FORMAT:

{
  "schemes": [
    {
      "scheme_name": "Scheme name",
      "description": "Short description of the scheme",
      "benefits": [
        "Benefit 1",
        "Benefit 2"
      ],
      "eligibility": [
        "Eligibility requirement 1",
        "Eligibility requirement 2"
      ],
      "state": "State name or All India",
      "application_url": null
    }
  ]
}
`;

    const messages = [
        {
            role: "system",
            content:
                "You provide accurate government agriculture scheme information for India. Always follow the requested JSON format."
        },
        {
            role: "user",
            content: prompt
        }
    ];

    const response = await callOpenRouter(messages);

    return response;
}


module.exports = {
    getSchemeRecommendations
};