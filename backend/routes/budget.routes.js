const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller");
const authenticate = require("../middlewares/auth.middleware");

router.post("/", authenticate, budgetController.setBudget);
router.get("/", authenticate, budgetController.getBudgets);
router.patch("/:id", authenticate, budgetController.updateBudget);
router.delete("/:id", authenticate, budgetController.deleteBudget);

module.exports = router;