import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Expenses.css";
import ExpenseCard from "../components/ExpenseCard";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "groceries", "rent", "utilities", "transportation", "entertainment",
  "dining", "subscriptions", "travel", "medical", "education"
];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", category: CATEGORIES[0], date: "", description: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/expenses", auth);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/expenses", {
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        description: form.description,
      }, auth);
      setForm({ amount: "", category: CATEGORIES[0], date: "", description: "" });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`, auth);
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="expenses-container">
      <h2>Your Expenses</h2>

      <button className="add-expense-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add Expense"}
      </button>

      {showForm && (
        <form className="expense-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount (USD)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit" className="submit-btn">Save Expense</button>
        </form>
      )}

      <div className="expenses-list">
        {expenses.length === 0 ? (
          <p className="no-expenses">No expenses yet. Add your first one above.</p>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} onDelete={handleDelete} />
          ))
        )}
      </div>

      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default Expenses;
