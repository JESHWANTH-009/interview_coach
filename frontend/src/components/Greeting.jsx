import React from 'react';
import './Greeting.css';

function Greeting({ name }) {
  return (
    <div className="greeting-section">
      <h1 className="greeting-title">Welcome back, {name}!</h1>
      <p className="greeting-subtitle">Ready to practice your next interview? Let's keep the momentum going.</p>
    </div>
  );
}

export default Greeting; 