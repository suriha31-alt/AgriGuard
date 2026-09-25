const express = require("express");

const {
    createProfile,
    getMyProfile,
    updateMyProfile
} = require("../controllers/profileController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

// All profile routes require login
router.use(authenticateToken);

// Create farmer profile
router.post("/", createProfile);

// Get logged-in user's profile
router.get("/me", getMyProfile);

// Update logged-in user's profile
router.put("/me", updateMyProfile);

module.exports = router;