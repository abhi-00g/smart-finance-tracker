import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Insights.css";

function Insights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchInsights = async () => {
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    setError("");
    setInsights("");
    try {
      const res = await axios.get("/api/ai/insights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInsights(res.data.insights);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get AI insights. Make sure you have expenses and budgets set up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insights-container">
      <h2>AI Financial Insights</h2>
      <p className="insights-subtitle">
        Get personalized saving suggestions powered by Cohere's AI, based on your expenses and budgets.
      </p>

      <button className="generate-btn" onClick={fetchInsights} disabled={loading}>
        {loading ? "Analyzing..." : "Generate Insights"}
      </button>

      {error && <p className="insights-error">{error}</p>}

      {insights && (
        <div className="insights-result">
          <h3>💡 Suggestions</h3>
          <div className="insights-text">
            {insights.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Insights;
