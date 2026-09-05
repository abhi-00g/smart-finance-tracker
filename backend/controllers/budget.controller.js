const db = require("../models");
const Budget = db.Budget;
const Expense = db.Expense;

const categories = require("../utils/categories");

// Create or update budget
exports.setBudget = async (req, res) => {
  const { category, limit } = req.body;

  if (!category || !limit) {
    return res.status(400).json({ message: "Category and limit are required." });
  }

  if (typeof limit !== "number" || limit <= 0) {
    return res.status(400).json({ message: "Limit must be a positive number in USD." });
  }

  const cleanedCategory = category.trim().toLowerCase();
  const isCustomCategory = !categories.includes(cleanedCategory);

  try {
    const existing = await Budget.findOne({
      where: {
        userId: req.user.id,
        category: cleanedCategory
      }
    });

    if (existing) {
        return res.status(409).json({
          message: `Budget for '${cleanedCategory}' already exists. Please use PATCH to update it.`,
          existingBudget: existing
        });
      }

    const newBudget = await Budget.create({
      userId: req.user.id,
      category: cleanedCategory,
      limit,
      isCustomCategory
    });

    res.status(201).json({ message: "Budget set successfully.", budget: newBudget });
  } catch (err) {
    console.error("Budget error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get budgets with current spending and remaining
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({ where: { userId: req.user.id } });

    const result = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Expense.sum("amount", {
          where: {
            userId: req.user.id,
            category: budget.category
          }
        });

        return {
          category: budget.category,
          limit: budget.limit,
          spent: spent || 0,
          remaining: budget.limit - (spent || 0),
          isCustomCategory: budget.isCustomCategory,
          currency: "USD"
        };
      })
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateBudget = async (req, res) => {
    const { id } = req.params;
    const { limit } = req.body;
  
    if (!limit || typeof limit !== "number" || limit <= 0) {
      return res.status(400).json({ message: "Limit must be a positive number." });
    }
  
    try {
      const budget = await Budget.findOne({ where: { id, userId: req.user.id } });
  
      if (!budget) {
        return res.status(404).json({ message: "Budget not found." });
      }
  
      budget.limit = limit;
      await budget.save();
  
      res.status(200).json({ message: "Budget updated successfully.", budget });
    } catch (err) {
      console.error("Error updating budget:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  exports.deleteBudget = async (req, res) => {
    const { id } = req.params;
  
    try {
      const budget = await Budget.findOne({ where: { id, userId: req.user.id } });
  
      if (!budget) {
        return res.status(404).json({ message: "Budget not found." });
      }
  
      await budget.destroy();
      res.status(200).json({ message: "Budget deleted successfully." });
    } catch (err) {
      console.error("Error deleting budget:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };