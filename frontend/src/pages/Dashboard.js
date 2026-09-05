import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pie, setPie] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    axios.get("/api/user/me", auth).then(res => setUser(res.data)).catch(() => {});
    axios.get("/api/summary/dashboard", auth).then(res => setSummary(res.data)).catch(() => {});
    axios.get("/api/summary/pie", auth).then(res => setPie(res.data.data || [])).catch(() => {});
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await axios.get(`/api/export/${type}`, { ...auth, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const total = pie.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name || "User"}</h1>
      <p className="dashboard-subtitle">Here's a summary of your finances.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card highlight">
          <h3>Total Spent</h3>
          <p className="card-amount">${summary?.totalSpent?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="dashboard-card">
          <h3>Top Categories</h3>
          <ul>
            {summary?.topCategories?.length > 0 ? (
              summary.topCategories.map((item, i) => (
                <li key={i}>{item.category} — ${item.total.toFixed(2)}</li>
              ))
            ) : (
              <li className="empty">No expenses yet</li>
            )}
          </ul>
        </div>
        <div className="dashboard-card">
          <h3>Recurring</h3>
          <ul>
            {summary?.recurringSubscriptions?.length > 0 ? (
              summary.recurringSubscriptions.map((sub, i) => (
                <li key={i}>{sub.category}: ${sub.total.toFixed(2)} ({sub.count}x)</li>
              ))
            ) : (
              <li className="empty">None detected</li>
            )}
          </ul>
        </div>
      </div>

      {/* Pie chart */}
      {pie.length > 0 && (
        <div className="pie-section">
          <h2>Spending by Category</h2>
          <div className="pie-layout">
            <svg viewBox="0 0 200 200" className="pie-chart">
              {(() => {
                let cumulative = 0;
                return pie.map((slice, i) => {
                  const pct = slice.amount / total;
                  const startAngle = cumulative * 2 * Math.PI;
                  cumulative += pct;
                  const endAngle = cumulative * 2 * Math.PI;
                  const largeArc = pct > 0.5 ? 1 : 0;
                  const x1 = 100 + 80 * Math.cos(startAngle - Math.PI / 2);
                  const y1 = 100 + 80 * Math.sin(startAngle - Math.PI / 2);
                  const x2 = 100 + 80 * Math.cos(endAngle - Math.PI / 2);
                  const y2 = 100 + 80 * Math.sin(endAngle - Math.PI / 2);
                  return (
                    <path
                      key={i}
                      d={`M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  );
                });
              })()}
            </svg>
            <div className="pie-legend">
              {pie.map((slice, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="legend-label">{slice.category}</span>
                  <span className="legend-value">${slice.amount.toFixed(2)} ({slice.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button onClick={() => navigate("/expenses")}>Manage Expenses</button>
        <button onClick={() => navigate("/budgets")}>Manage Budgets</button>
        <button onClick={() => navigate("/insights")}>AI Insights</button>
        <button className="export-btn" onClick={() => handleExport("expenses")}>Export Expenses CSV</button>
        <button className="export-btn" onClick={() => handleExport("budgets")}>Export Budgets CSV</button>
      </div>
    </div>
  );
}

export default Dashboard;
