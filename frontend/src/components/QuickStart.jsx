import React from 'react';
import './QuickStart.css';

function QuickStart({ onStartNew }) {
  return (
    <div className="quickstart-card">
      <div className="quickstart-title">Quick Start</div>
      <div className="quickstart-subtitle">Jump right into your next practice session</div>
      <button className="quickstart-btn-primary" onClick={onStartNew}>
        + Start New Interview
      </button>
    </div>
  );
}

export default QuickStart; 