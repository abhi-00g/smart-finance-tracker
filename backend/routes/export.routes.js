const express = require("express");
const router = express.Router();
const exportController = require("../controllers/export.controller");
const authenticate = require("../middlewares/auth.middleware");

router.get("/expenses", authenticate, exportController.exportExpenses);
router.get("/budgets", authenticate, exportController.exportBudgets);

module.exports = router;