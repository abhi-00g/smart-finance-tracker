import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Budgets.css";

const CATEGORIES = [
  "groceries", "rent", "utilities", "transportation", "entertainment",
  "dining", "subscriptions", "travel", "medical", "education"
];

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], limit: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await axios.get("/api/budgets", auth);
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/budgets", {
        category: form.category,
        limit: parseFloat(form.limit),
      }, auth);
      setForm({ category: CATEGORIES[0], limit: "" });
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create budget.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/budgets/${id}`, auth);
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  return (
    <div className="budgets-container">
      <h2>Your Budgets</h2>

      <button className="add-budget-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Set Budget"}
      </button>

      {showForm && (
        <form className="budget-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monthly limit (USD)"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
            required
          />
          <button type="submit" className="submit-btn">Save Budget</button>
        </form>
      )}

      <div className="budgets-list">
        {budgets.length === 0 ? (
          <p className="no-budgets">No budgets set. Create one above.</p>
        ) : (
          budgets.map((b, i) => {
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
            const isOver = b.spent > b.limit;
            return (
              <div key={i} className={`budget-card ${isOver ? "over-budget" : ""}`}>
                <div className="budget-header">
                  <h4>{b.category} {b.isCustomCategory && <span className="custom-tag">custom</span>}</h4>
                  <button className="delete-btn" onClick={() => handleDelete(b.id || budgets[i]?.id)}>✕</button>
                </div>
                <div className="budget-numbers">
                  <span>${b.spent.toFixed(2)} spent</span>
                  <span>of ${b.limit.toFixed(2)}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isOver ? "over" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={`budget-remaining ${isOver ? "over-text" : ""}`}>
                  {isOver
                    ? `$${(b.spent - b.limit).toFixed(2)} over budget`
                    : `$${b.remaining.toFixed(2)} remaining`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Budgets;
