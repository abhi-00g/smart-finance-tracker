const db = require("../models");
const { CohereClient } = require("cohere-ai");
require("dotenv").config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await db.Expense.findAll({ where: { userId } });
    const budgets = await db.Budget.findAll({ where: { userId } });

    if (!expenses.length && !budgets.length) {
      return res.status(400).json({ message: "No data available for insights." });
    }

    const expenseSummary = expenses.map(e => `- ${e.category}: $${e.amount} on ${e.date}`).join("\n");
    const budgetSummary = budgets.map(b => `- ${b.category}: limit $${b.limit}`).join("\n");

    const userPrompt = `
You are a smart financial assistant. Analyze the user's budgets and expenses and provide 3 insightful suggestions to save money.

Budgets:
${budgetSummary}

Expenses:
${expenseSummary}
`;

    // ✅ Correct usage of chat with messages[] (required in v5+)
    const response = await cohere.chat({
      model: "command-r-plus",
      message: userPrompt,
      temperature: 0.7
    });

    const reply = response.text;
    res.status(200).json({ insights: reply });
  } catch (err) {
    console.error("Cohere error:", err);
    res.status(500).json({ message: "AI service failed or misconfigured." });
  }
};