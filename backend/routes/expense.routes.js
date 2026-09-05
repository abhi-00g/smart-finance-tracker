const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");
const authenticate = require("../middlewares/auth.middleware");

router.post("/", authenticate, expenseController.createExpense);
router.get("/", authenticate, expenseController.getExpenses);
router.get("/recurring", authenticate, expenseController.getRecurringExpenses);
router.delete("/:id", authenticate, expenseController.deleteExpense);

module.exports = router;