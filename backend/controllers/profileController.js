const { pool } = require("../services/databaseService");

async function createProfile(req, res) {
    try {
        const userId = req.user.userId;

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

        // Check whether this user already has a profile
        const [existingProfiles] = await pool.execute(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (existingProfiles.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Farmer profile already exists"
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO farmer_profiles
            (
                user_id,
                state,
                district,
                land_size,
                land_unit,
                crop_type,
                farming_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
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


async function getMyProfile(req, res) {
    try {
        const userId = req.user.userId;

        const [rows] = await pool.execute(
            "SELECT * FROM farmer_profiles WHERE user_id = ?",
            [userId]
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


async function updateMyProfile(req, res) {
    try {
        const userId = req.user.userId;

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
             WHERE user_id = ?`,
            [
                state,
                district,
                landSize,
                land_unit,
                crop_type,
                farming_type,
                userId
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
    getMyProfile,
    updateMyProfile
};