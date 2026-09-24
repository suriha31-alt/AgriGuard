const express = require("express");

const {
    createProfile,
    getProfile,
    updateProfile
} = require("../controllers/profileController");

const router = express.Router();

router.post("/", createProfile);

router.get("/:id", getProfile);

router.put("/:id", updateProfile);

module.exports = router;