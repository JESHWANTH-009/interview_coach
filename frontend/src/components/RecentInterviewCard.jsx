import React from 'react';
import './RecentInterviewCard.css';

function getScoreColor(score) {
  if (score >= 85) return 'score-pill-green';
  if (score >= 70) return 'score-pill-yellow';
  return 'score-pill-blue';
}

function RecentInterviewCard({ title, date, progress, score, onViewDetails }) {
  // Format date
  let dateStr = '';
  if (date) {
    if (typeof date === 'string') dateStr = date;
    else if (date.seconds) dateStr = new Date(date.seconds * 1000).toLocaleDateString();
    else dateStr = new Date(date).toLocaleDateString();
  }

  // Parse score and denominator from progress string (e.g., '7/10')
  let scoreValue = 0;
  let scoreTotal = 10;
  if (progress) {
    const match = progress.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      scoreValue = parseInt(match[1], 10);
      scoreTotal = parseInt(match[2], 10);
    }
  } else if (typeof score === 'number') {
    scoreValue = score;
  }
  const percent = scoreTotal > 0 ? Math.round((scoreValue / scoreTotal) * 100) : 0;

  return (
    <div className="recent-card">
      <div className="recent-card-row">
        <div className="recent-card-title">{title}</div>
      </div>
      <div className="recent-card-row recent-card-date-row">
        <span className="recent-card-date">{dateStr}</span>
      </div>
      <div className="recent-card-bar-row">
        <button className="recent-card-details-link" onClick={onViewDetails}>View Details</button>
      </div>
    </div>
  );
}

export default RecentInterviewCard; 