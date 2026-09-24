const express = require("express");

const {
    recommendCrops
} = require("../controllers/cropRecommendationController");

const router = express.Router();

router.post(
    "/recommend",
    recommendCrops
);

module.exports = router;