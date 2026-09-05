const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summary.controller");
const authenticate = require("../middlewares/auth.middleware");

router.get("/pie", authenticate, summaryController.getPieSummary);

module.exports = router;