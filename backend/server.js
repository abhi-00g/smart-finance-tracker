const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/expenses", require("./routes/expense.routes"));
app.use("/api/budgets", require("./routes/budget.routes"));
app.use("/api/summary", require("./routes/summary.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/export", require("./routes/export.routes"));
app.use("/api/user", require("./routes/user.routes"));

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
  db.sequelize.authenticate()
    .then(() => console.log("Connected to PostgreSQL."))
    .catch((err) => console.error("DB connection error:", err));

  db.sequelize.sync()
    .then(() => console.log("Synced DB."))
    .catch((err) => console.error("Sync error:", err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

module.exports = app;
