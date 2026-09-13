async function getSchemes(req, res) {
    try {
        res.json({
            success: true,
            message: "Government Schemes API is working"
        });
    } catch (error) {
        console.error("Scheme Controller Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch government schemes"
        });
    }
}

module.exports = {
    getSchemes
};