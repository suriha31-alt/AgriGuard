const express = require("express");

const {
    getSchemes
} = require("../controllers/schemeController");

const router = express.Router();

/*
    Get government schemes based on
    a farmer profile.

    Example:
    GET /api/schemes/1
*/
router.get("/:profileId", getSchemes);

module.exports = router;