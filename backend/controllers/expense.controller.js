const db = require("../models");
const Expense = db.Expense;
const { detectRecurring } = require("../services/recurrence.service");

exports.createExpense = async (req, res) => {
  const { amount, category, date, description } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ message: "Amount, category, and date are required." });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number in USD." });
  }

  try {
    const newExpense = await Expense.create({
      userId: req.user.id,
      amount,
      category,
      date,
      description
    });

    res.status(201).json({
      message: "Expense added successfully.",
      expense: {
        ...newExpense.toJSON(),
        currency: "USD"  // ✅ Explicitly return currency
      }
    });
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [["date", "DESC"]]
    });

    // ✅ Map to include currency in response
    const result = expenses.map(exp => ({
      ...exp.toJSON(),
      currency: "USD"
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findOne({
      where: { id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    await expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getRecurringExpenses = async (req, res) => {
  try {
    const expenses = await db.Expense.findAll({
      where: { userId: req.user.id },
      order: [["date", "ASC"]]
    });

    const recurring = detectRecurring(expenses);

    res.status(200).json({ recurring });
  } catch (err) {
    console.error("Error detecting recurring expenses:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};