
const { pool } = require("../services/databaseService");
const { getSchemeRecommendations } = require("../services/aiService");

/*
|--------------------------------------------------------------------------
| Verified Government Scheme URLs
|--------------------------------------------------------------------------
*/

const VERIFIED_SCHEME_URLS = {
    "pm kisan":
        "https://www.pmkisan.gov.in/RegistrationFormupdated.aspx",

    "pradhan mantri kisan samman nidhi":
        "https://www.pmkisan.gov.in/RegistrationFormupdated.aspx",

    pmfby:
        "https://pmfby.gov.in/farmerRegistrationForm",

    "pradhan mantri fasal bima yojana":
        "https://pmfby.gov.in/farmerRegistrationForm",

    "soil health card":
        "https://soilhealth.dac.gov.in/",

    "soil health card scheme":
        "https://soilhealth.dac.gov.in/",

    "pradhan mantri krishi sinchayee yojana":
        "https://pmksy.gov.in/",

    pmksy:
        "https://pmksy.gov.in/"
};

const MYSCHEME_URL = "https://www.myscheme.gov.in/";

/*
|--------------------------------------------------------------------------
| Normalize Scheme Names
|--------------------------------------------------------------------------
*/

function normalizeSchemeName(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[()]/g, " ")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/*
|--------------------------------------------------------------------------
| Get Official Application URL
|--------------------------------------------------------------------------
*/

function getApplicationDetails(schemeName) {
    const name = normalizeSchemeName(schemeName);

    if (
        name.includes("pm kisan") ||
        name.includes("pradhan mantri kisan samman nidhi")
    ) {
        return {
            application_url: VERIFIED_SCHEME_URLS["pm kisan"],
            application_type: "direct_official"
        };
    }

    if (
        name.includes("pmfby") ||
        name.includes("fasal bima")
    ) {
        return {
            application_url: VERIFIED_SCHEME_URLS.pmfby,
            application_type: "direct_official"
        };
    }

    if (name.includes("soil health card")) {
        return {
            application_url: VERIFIED_SCHEME_URLS["soil health card"],
            application_type: "direct_official"
        };
    }

    if (
        name.includes("pmksy") ||
        name.includes("pradhan mantri krishi sinchayee yojana")
    ) {
        return {
            application_url: VERIFIED_SCHEME_URLS.pmksy,
            application_type: "direct_official"
        };
    }

    return {
        application_url: MYSCHEME_URL,
        application_type: "myscheme_fallback"
    };
}

/*
|--------------------------------------------------------------------------
| Remove Duplicate Schemes
|--------------------------------------------------------------------------
*/

function removeDuplicateSchemes(schemes) {
    const seen = new Set();

    return schemes.filter((scheme) => {
        const name = normalizeSchemeName(scheme.scheme_name);
        let identity = name;

        if (
            name.includes("pm kisan") ||
            name.includes("pradhan mantri kisan samman nidhi")
        ) {
            identity = "pm kisan";
        } else if (
            name.includes("pmfby") ||
            name.includes("fasal bima")
        ) {
            identity = "pmfby";
        } else if (name.includes("soil health card")) {
            identity = "soil health card";
        } else if (
            name.includes("pmksy") ||
            name.includes("pradhan mantri krishi sinchayee yojana")
        ) {
            identity = "pmksy";
        }

        if (seen.has(identity)) {
            return false;
        }

        seen.add(identity);
        return true;
    });
}

/*
|--------------------------------------------------------------------------
| Normalize Text Arrays
|--------------------------------------------------------------------------
*/

function normalizeTextArray(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    // Handle an AI response that returns one string instead of an array.
    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }

    return [];
}

/*
|--------------------------------------------------------------------------
| Validate AI Scheme Response
|--------------------------------------------------------------------------
*/

function validateSchemes(aiResponse) {
    if (
        !aiResponse ||
        typeof aiResponse !== "object" ||
        !Array.isArray(aiResponse.schemes)
    ) {
        return [];
    }

    const schemes = aiResponse.schemes
        .filter(
            (scheme) =>
                scheme &&
                typeof scheme === "object" &&
                !Array.isArray(scheme) &&
                typeof scheme.scheme_name === "string" &&
                scheme.scheme_name.trim() !== ""
        )
        .map((scheme) => {
            const application = getApplicationDetails(
                scheme.scheme_name
            );

            return {
                scheme_name: scheme.scheme_name.trim(),

                description:
                    typeof scheme.description === "string"
                        ? scheme.description.trim()
                        : "",

                benefits: normalizeTextArray(scheme.benefits),

                eligibility: normalizeTextArray(scheme.eligibility),

                state:
                    typeof scheme.state === "string"
                        ? scheme.state.trim()
                        : "",

                application_url: application.application_url,

                application_type: application.application_type
            };
        });

    return removeDuplicateSchemes(schemes);
}

/*
|--------------------------------------------------------------------------
| Extract JSON Object From AI Response
|--------------------------------------------------------------------------
| Handles:
| - Plain JSON
| - Markdown JSON code fences
| - Explanatory text before or after the JSON
| - Braces inside quoted strings
|--------------------------------------------------------------------------
*/

function parseAIJson(aiResult) {
    if (typeof aiResult !== "string" || !aiResult.trim()) {
        throw new Error("AI service returned an empty response.");
    }

    const cleanedResponse = aiResult
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // First attempt: response is already valid JSON.
    try {
        return JSON.parse(cleanedResponse);
    } catch {
        // Continue and attempt to extract the JSON object.
    }

    const startIndex = cleanedResponse.indexOf("{");

    if (startIndex === -1) {
        throw new Error("No JSON object found in AI response.");
    }

    let depth = 0;
    let inString = false;
    let escaped = false;
    let endIndex = -1;

    for (let i = startIndex; i < cleanedResponse.length; i++) {
        const char = cleanedResponse[i];

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
                endIndex = i;
                break;
            }
        }
    }

    if (endIndex === -1) {
        throw new Error("AI response contains incomplete JSON.");
    }

    const jsonText = cleanedResponse.slice(
        startIndex,
        endIndex + 1
    );

    return JSON.parse(jsonText);
}

/*
|--------------------------------------------------------------------------
| GET /api/schemes/me
| Government Schemes for Logged-in Farmer
|--------------------------------------------------------------------------
*/

async function getMySchemes(req, res) {
    try {
        // 1. Validate authenticated user.
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required. Please log in again."
            });
        }

        // 2. Fetch farmer profile.
        const [rows] = await pool.execute(
            `SELECT
                id,
                user_id,
                state,
                district,
                land_size,
                land_unit,
                crop_type,
                farming_type
             FROM farmer_profiles
             WHERE user_id = ?`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Farmer profile not found. Please create your farmer profile first."
            });
        }

        const farmer = rows[0];

        console.log(
            `Generating government schemes for user ${userId}, profile ${farmer.id}`
        );

        // 3. Request recommendations from AI.
        const aiResult = await getSchemeRecommendations(farmer);

        if (typeof aiResult !== "string" || !aiResult.trim()) {
            console.error(
                "AI service returned an empty or invalid response."
            );

            return res.status(502).json({
                success: false,
                message: "AI service returned an empty scheme response."
            });
        }

        // 4. Parse AI response.
        let parsedResponse;

        try {
            parsedResponse = parseAIJson(aiResult);

            if (
                !parsedResponse ||
                typeof parsedResponse !== "object" ||
                Array.isArray(parsedResponse) ||
                !Array.isArray(parsedResponse.schemes)
            ) {
                throw new Error(
                    'AI response must contain a "schemes" array.'
                );
            }
        } catch (parseError) {
            console.error(
                "AI JSON Parse/Validation Error:",
                parseError.message
            );

            // Log the response for debugging. Avoid logging sensitive
            // farmer details or API credentials.
            console.error("AI Raw Response:", aiResult);

            return res.status(502).json({
                success: false,
                message: "AI returned an invalid scheme response."
            });
        }

        // 5. Validate, normalize, and deduplicate recommendations.
        const schemes = validateSchemes(parsedResponse);

        // 6. Return results in the expected frontend response format.
        return res.status(200).json({
            success: true,
            profile: {
                id: farmer.id,
                state: farmer.state,
                district: farmer.district,
                land_size: farmer.land_size,
                land_unit: farmer.land_unit,
                crop_type: farmer.crop_type,
                farming_type: farmer.farming_type
            },
            schemes
        });
    } catch (error) {
        console.error("Government Schemes Controller Error:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: "Failed to fetch government schemes",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
}

module.exports = {
    getMySchemes
};
