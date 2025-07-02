import React from 'react';
import './StatsCard.css';

function StatsCard({ icon, label, value }) {
  return (
    <div className="stats-card">
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-row">
        <div className="stats-card-value">{value}</div>
        <div className="stats-card-icon">{icon}</div>
      </div>
    </div>
  );
}

export default StatsCard; 