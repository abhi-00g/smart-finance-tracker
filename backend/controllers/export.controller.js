const db = require("../models");
const { Parser } = require("json2csv");

exports.exportExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await db.Expense.findAll({ where: { userId } });

    const expenseData = expenses.map(e => ({
      Date: e.date,
      Category: e.category,
      Amount: e.amount,
      Description: e.description,
      Currency: "USD"
    }));

    const parser = new Parser();
    const csv = parser.parse(expenseData);

    res.header("Content-Type", "text/csv");
    res.attachment("expenses.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Export Expenses Error:", err);
    res.status(500).json({ message: "Failed to export expenses." });
  }
};

exports.exportBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await db.Budget.findAll({ where: { userId } });

    const budgetData = await Promise.all(
      budgets.map(async (b) => {
        const spent = await db.Expense.sum("amount", {
          where: { userId, category: b.category }
        });

        return {
          Category: b.category,
          Limit: b.limit,
          Spent: spent || 0,
          Remaining: b.limit - (spent || 0),
          Custom: b.isCustomCategory ? "Yes" : "No",
          Currency: "USD"
        };
      })
    );

    const parser = new Parser();
    const csv = parser.parse(budgetData);

    res.header("Content-Type", "text/csv");
    res.attachment("budgets.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Export Budgets Error:", err);
    res.status(500).json({ message: "Failed to export budgets." });
  }
};