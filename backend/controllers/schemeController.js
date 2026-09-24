const { pool } = require("../services/databaseService");
const {
    getSchemeRecommendations
} = require("../services/aiService");


/*
    Check whether a URL looks like an official
    Indian government website.
*/
function isOfficialGovernmentUrl(url) {

    if (!url || typeof url !== "string") {
        return false;
    }

    try {

        const parsedUrl = new URL(url);

        // Only HTTPS URLs are allowed
        if (parsedUrl.protocol !== "https:") {
            return false;
        }

        const hostname = parsedUrl.hostname.toLowerCase();

        /*
            Accept:
            - gov.in
            - nic.in
            - official state government domains

            We intentionally do NOT accept arbitrary domains.
        */

        const officialDomains = [
            ".gov.in",
            ".nic.in",
            ".gov",
            ".nic"
        ];

        return officialDomains.some(domain =>
            hostname.endsWith(domain)
        );

    } catch (error) {

        return false;
    }
}


/*
    Clean and validate the schemes returned by the AI.
*/
function validateSchemes(aiResponse) {

    if (!aiResponse || typeof aiResponse !== "object") {
        return [];
    }

    if (!Array.isArray(aiResponse.schemes)) {
        return [];
    }

    return aiResponse.schemes
        .filter(scheme => {

            return (
                scheme &&
                typeof scheme === "object" &&
                typeof scheme.scheme_name === "string" &&
                scheme.scheme_name.trim() !== ""
            );

        })
        .map(scheme => {

            let applicationUrl = null;

            if (isOfficialGovernmentUrl(scheme.application_url)) {
                applicationUrl = scheme.application_url;
            }

            return {
                scheme_name: scheme.scheme_name.trim(),

                description:
                    typeof scheme.description === "string"
                        ? scheme.description.trim()
                        : "",

                benefits:
                    Array.isArray(scheme.benefits)
                        ? scheme.benefits
                            .filter(item => typeof item === "string")
                            .map(item => item.trim())
                        : [],

                eligibility:
                    Array.isArray(scheme.eligibility)
                        ? scheme.eligibility
                            .filter(item => typeof item === "string")
                            .map(item => item.trim())
                        : [],

                state:
                    typeof scheme.state === "string"
                        ? scheme.state.trim()
                        : "",

                application_url: applicationUrl
            };

        });
}


/*
    GET /api/schemes/:profileId

    Example:
    GET http://localhost:5000/api/schemes/1
*/
async function getSchemes(req, res) {

    try {

        const { profileId } = req.params;

        const id = Number(profileId);

        /*
            Validate profile ID
        */
        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                success: false,
                message: "Profile ID must be a valid positive integer"
            });

        }


        /*
            Get farmer profile from MySQL
        */
        const [rows] = await pool.execute(
            "SELECT * FROM farmer_profiles WHERE id = ?",
            [id]
        );


        /*
            Check whether farmer profile exists
        */
        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });

        }


        const farmer = rows[0];


        console.log(
            `Generating government schemes for farmer profile ${id}...`
        );


        /*
            Send farmer information to AI service
        */
        const aiResult =
            await getSchemeRecommendations(farmer);


        /*
            AI may sometimes return Markdown code fences.

            Example:

            ```json
            {
                "schemes": [...]
            }
            ```

            Remove them before JSON parsing.
        */
        let cleanedResponse = aiResult.trim();

        if (cleanedResponse.startsWith("```")) {

            cleanedResponse = cleanedResponse
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

        }


        /*
            Convert AI response into JavaScript object
        */
        let parsedResponse;

        try {

            parsedResponse = JSON.parse(cleanedResponse);

        } catch (error) {

            console.error(
                "AI JSON Parse Error:",
                error.message
            );

            console.error(
                "AI Raw Response:",
                aiResult
            );

            return res.status(502).json({
                success: false,
                message: "AI returned an invalid scheme response"
            });

        }


        /*
            Validate and clean schemes
        */
        const schemes =
            validateSchemes(parsedResponse);


        /*
            Return clean response to frontend
        */
        return res.json({

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

            schemes: schemes

        });


    } catch (error) {

        console.error(
            "Government Schemes Controller Error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to fetch government schemes"
        });

    }
}


module.exports = {
    getSchemes
};