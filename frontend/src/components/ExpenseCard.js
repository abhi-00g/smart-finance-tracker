import React from "react";
import "../styles/ExpenseCard.css";

function ExpenseCard({ expense, onDelete }) {
  return (
    <div className="expense-card">
      <div className="expense-card-header">
        <h4>{expense.category}</h4>
        {onDelete && (
          <button className="delete-btn" onClick={() => onDelete(expense.id)}>
            ✕
          </button>
        )}
      </div>
      <p>Amount: ${expense.amount.toFixed(2)}</p>
      <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
      <p>Description: {expense.description || "—"}</p>
    </div>
  );
}

export default ExpenseCard;
