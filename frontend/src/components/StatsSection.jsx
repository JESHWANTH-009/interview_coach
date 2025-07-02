import React from 'react';
import StatsCard from './StatsCard';
import './StatsSection.css';

function StatsSection({ stats }) {
  return (
    <div className="stats-section">
      {stats.map((stat, idx) => (
        <StatsCard key={idx} icon={stat.icon} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}

export default StatsSection; 