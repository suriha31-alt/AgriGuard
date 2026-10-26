
const https = require("https");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

/*
|--------------------------------------------------------------------------
| Extract a JSON object from AI-generated text
|--------------------------------------------------------------------------
| Handles plain JSON, Markdown fences, and extra text before/after JSON.
|--------------------------------------------------------------------------
*/

function extractJsonObject(text) {
    if (typeof text !== "string" || !text.trim()) {
        throw new Error("AI returned empty response content.");
    }

    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // Try parsing the complete response first.
    try {
        return JSON.parse(cleaned);
    } catch {
        // The response may contain extra text around the JSON.
    }

    const start = cleaned.indexOf("{");

    if (start === -1) {
        throw new Error("AI response does not contain a JSON object.");
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }

            continue;
        }

        if (char === '"') {
            inString = true;
        } else if (char === "{") {
            depth++;
        } else if (char === "}") {
            depth--;

            if (depth === 0) {
                const jsonText = cleaned.slice(start, i + 1);
                return JSON.parse(jsonText);
            }
        }
    }

    throw new Error("AI response contains incomplete JSON.");
}

/*
|--------------------------------------------------------------------------
| Validate and normalize scheme response
|--------------------------------------------------------------------------
*/

function normalizeSchemeResponse(response) {
    if (
        !response ||
        typeof response !== "object" ||
        Array.isArray(response) ||
        !Array.isArray(response.schemes)
    ) {
        throw new Error(
            'AI response must contain a "schemes" array.'
        );
    }

    const schemes = response.schemes.map((scheme, index) => {
        if (
            !scheme ||
            typeof scheme !== "object" ||
            Array.isArray(scheme) ||
            typeof scheme.scheme_name !== "string" ||
            !scheme.scheme_name.trim()
        ) {
            throw new Error(
                `Invalid scheme entry at index ${index}.`
            );
        }

        return {
            scheme_name: scheme.scheme_name.trim(),

            description:
                typeof scheme.description === "string"
                    ? scheme.description.trim()
                    : "",

            benefits: normalizeStringArray(scheme.benefits),

            eligibility: normalizeStringArray(scheme.eligibility),

            state:
                typeof scheme.state === "string"
                    ? scheme.state.trim()
                    : "",

            // The controller assigns trusted application URLs.
            application_url: null
        };
    });

    return { schemes };
}

function normalizeStringArray(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }

    return [];
}

/*
|--------------------------------------------------------------------------
| OpenRouter API Request
|--------------------------------------------------------------------------
*/

function callOpenRouter(messages) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();

        if (!apiKey) {
            return reject(
                new Error(
                    "OPENROUTER_API_KEY is missing. Check backend/.env."
                )
            );
        }

        const requestData = JSON.stringify({
            model: "openrouter/free",
            messages,
            temperature: 0.1
        });

        const options = {
            hostname: "openrouter.ai",
            port: 443,
            path: "/api/v1/chat/completions",
            method: "POST",
            family: 4,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestData),
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "AgriGuard"
            }
        };

        const req = https.request(options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return reject(
                        new Error(
                            `OpenRouter returned invalid JSON (HTTP ${res.statusCode}).`
                        )
                    );
                }

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const apiMessage =
                        data?.error?.message ||
                        data?.message ||
                        "Unknown OpenRouter error";

                    console.error("OpenRouter API Error:", {
                        status: res.statusCode,
                        message: apiMessage,
                        code: data?.error?.code
                    });

                    if (res.statusCode === 401) {
                        return reject(
                            new Error(
                                "OpenRouter authentication failed. Check OPENROUTER_API_KEY."
                            )
                        );
                    }

                    return reject(
                        new Error(
                            `OpenRouter request failed (HTTP ${res.statusCode}): ${apiMessage}`
                        )
                    );
                }

                const content = data?.choices?.[0]?.message?.content;

                if (typeof content !== "string" || !content.trim()) {
                    console.error(
                        "OpenRouter returned no usable text content.",
                        {
                            finish_reason: data?.choices?.[0]?.finish_reason
                        }
                    );

                    return reject(
                        new Error(
                            "OpenRouter returned no text content. The model may have failed to generate a response."
                        )
                    );
                }

                resolve(content.trim());
            });
        });

        req.setTimeout(30000, () => {
            req.destroy(
                new Error("OpenRouter request timed out after 30 seconds.")
            );
        });

        req.on("error", (error) => {
            console.error("OpenRouter Connection Error:", error.message);
            reject(error);
        });

        req.write(requestData);
        req.end();
    });
}

/*
|--------------------------------------------------------------------------
| Government Scheme Recommendations
|--------------------------------------------------------------------------
*/

async function getSchemeRecommendations(farmer) {
    const prompt = `
You are AgriGuard's government agriculture scheme recommendation engine.

FARMER PROFILE:
State: ${farmer.state || "Not provided"}
District: ${farmer.district || "Not provided"}
Land size: ${farmer.land_size ?? "Not provided"}
Land unit: ${farmer.land_unit || "Not provided"}
Crops: ${farmer.crop_type || "Not provided"}
Farming type: ${farmer.farming_type || "Not provided"}

TASK:
Identify relevant Indian central and state government schemes
that may be useful for this farmer.

RULES:
1. Recommend real government schemes only.
2. Do not invent scheme names, benefits, or eligibility criteria.
3. Do not claim that the farmer is definitely eligible.
4. Clearly distinguish general scheme eligibility from the farmer's
   confirmed eligibility.
5. Do not include explanations, safety labels, Markdown, or code fences.
6. Return exactly one valid JSON object matching the schema below.
7. If no relevant schemes can be identified, return {"schemes": []}.
8. Do not generate application URLs. The application URLs are assigned
   separately by the application.

REQUIRED JSON SCHEMA:
{
  "schemes": [
    {
      "scheme_name": "Official scheme name",
      "description": "Brief description",
      "benefits": ["Benefit description"],
      "eligibility": ["Eligibility requirement"],
      "state": "Applicable state or All India"
    }
  ]
}
`;

    const messages = [
        {
            role: "system",
            content:
                "You provide careful information about Indian government agriculture schemes. Output a single valid JSON object with a schemes array. Never add text outside the JSON."
        },
        {
            role: "user",
            content: prompt
        }
    ];

    const rawResponse = await callOpenRouter(messages);

    let parsedResponse;

    try {
        parsedResponse = extractJsonObject(rawResponse);
        parsedResponse = normalizeSchemeResponse(parsedResponse);
    } catch (error) {
        console.error("Scheme AI response parsing failed:", error.message);

        // Log a limited excerpt for debugging. Never log API credentials.
        console.error(
            "Scheme AI response excerpt:",
            rawResponse.slice(0, 2000)
        );

        throw new Error(
            `AI returned an invalid scheme response: ${error.message}`
        );
    }

    // The controller expects a string and parses it with JSON.parse().
    return JSON.stringify(parsedResponse);
}

module.exports = {
    getSchemeRecommendations
};
