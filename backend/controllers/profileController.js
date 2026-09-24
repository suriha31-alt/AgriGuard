const { pool } = require("../services/databaseService");

async function createProfile(req, res) {
    try {
        const {
            state,
            district,
            land_size,
            land_unit,
            crop_type,
            farming_type
        } = req.body;

        // Validate required fields
        if (
            !state ||
            !district ||
            land_size === undefined ||
            !land_unit ||
            !crop_type ||
            !farming_type
        ) {
            return res.status(400).json({
                success: false,
                message: "All farmer profile fields are required"
            });
        }

        // Validate land size
        const landSize = Number(land_size);

        if (Number.isNaN(landSize) || landSize <= 0) {
            return res.status(400).json({
                success: false,
                message: "Land size must be a valid positive number"
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO farmer_profiles
            (state, district, land_size, land_unit, crop_type, farming_type)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                state,
                district,
                landSize,
                land_unit,
                crop_type,
                farming_type
            ]
        );

        res.status(201).json({
            success: true,
            message: "Farmer profile created successfully",
            profileId: result.insertId
        });

    } catch (error) {
        console.error("Create Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create farmer profile"
        });
    }
}

async function getProfile(req, res) {
    try {
        const { id } = req.params;

        const profileId = Number(id);

        if (!Number.isInteger(profileId) || profileId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Profile ID must be a valid positive integer"
            });
        }

        const [rows] = await pool.execute(
            "SELECT * FROM farmer_profiles WHERE id = ?",
            [profileId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch farmer profile"
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { id } = req.params;

        const profileId = Number(id);

        if (!Number.isInteger(profileId) || profileId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Profile ID must be a valid positive integer"
            });
        }

        const {
            state,
            district,
            land_size,
            land_unit,
            crop_type,
            farming_type
        } = req.body;

        if (
            !state ||
            !district ||
            land_size === undefined ||
            !land_unit ||
            !crop_type ||
            !farming_type
        ) {
            return res.status(400).json({
                success: false,
                message: "All farmer profile fields are required"
            });
        }

        const landSize = Number(land_size);

        if (Number.isNaN(landSize) || landSize <= 0) {
            return res.status(400).json({
                success: false,
                message: "Land size must be a valid positive number"
            });
        }

        const [result] = await pool.execute(
            `UPDATE farmer_profiles
             SET state = ?,
                 district = ?,
                 land_size = ?,
                 land_unit = ?,
                 crop_type = ?,
                 farming_type = ?
             WHERE id = ?`,
            [
                state,
                district,
                landSize,
                land_unit,
                crop_type,
                farming_type,
                profileId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        res.json({
            success: true,
            message: "Farmer profile updated successfully"
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update farmer profile"
        });
    }
}

module.exports = {
    createProfile,
    getProfile,
    updateProfile
};