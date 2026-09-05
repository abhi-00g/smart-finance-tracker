const db = require("../models");
const Expense = db.Expense;

exports.getPieSummary = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id }
    });

    if (!expenses || expenses.length === 0) {
      return res.status(200).json({ data: [], message: "No expenses yet." });
    }

    // Group by category
    const categoryMap = {};
    let total = 0;

    for (const exp of expenses) {
      const category = exp.category.toLowerCase();
      const amount = exp.amount;
      total += amount;

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category] += amount;
    }

    const data = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: parseFloat(((amount / total) * 100).toFixed(2)),
      currency: "USD"
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error("Pie Summary Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};