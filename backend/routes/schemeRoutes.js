const express = require("express");
const { getSchemes } = require("../controllers/schemeController");

const router = express.Router();

router.get("/", getSchemes);

module.exports = router;