const express = require("express");

const {
    getMySchemes
} = require("../controllers/schemeController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
    All government scheme requests
    require authentication.
*/
router.use(authenticateToken);

/*
    Get schemes for the currently
    logged-in farmer.

    GET /api/schemes/me
*/
router.get("/me", getMySchemes);

module.exports = router;