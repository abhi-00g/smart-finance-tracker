const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authenticate = require("../middlewares/auth.middleware");

router.post("/insights", authenticate, aiController.getInsights);

module.exports = router;