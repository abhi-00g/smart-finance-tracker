// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null); // ✅ used below correctly
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user info
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("👤 User info:", res.data);
      setUser(res.data); // ✅ fix here
    } catch (err) {
      console.error("❌ Failed to fetch user info:", err.response?.data || err.message);
    }
  };

  // ✅ Fetch dashboard summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get("/api/summary/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("📊 Dashboard Summary:", res.data);
      setSummary(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name || "User"}</h1>
      <p>Here’s a summary of your finances today.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Spent</h3>
          <p>$ {summary?.totalSpent?.toFixed(2) || 0}</p>
        </div>
        <div className="dashboard-card">
          <h3>Top Categories</h3>
          <ul>
            {summary?.topCategories?.length > 0 ? (
              summary.topCategories.map((item, i) => (
                <li key={i}>
                  {item.category} - ${item.total.toFixed(2)}
                </li>
              ))
            ) : (
              <li>—</li>
            )}
          </ul>
        </div>
        <div className="dashboard-card">
          <h3>Subscriptions</h3>
          <ul>
            {summary?.recurringSubscriptions?.length > 0 ? (
              summary.recurringSubscriptions.map((sub, i) => (
                <li key={i}>
                  {sub.category}: ${sub.total.toFixed(2)} ({sub.count}x)
                </li>
              ))
            ) : (
              <li>—</li>
            )}
          </ul>
        </div>
      </div>

      <button className="goto-expense-btn" onClick={() => navigate("/expenses")}>
        Go to Expenses
      </button>
    </div>
  );
}

export default Dashboard;