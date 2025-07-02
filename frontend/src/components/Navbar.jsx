import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">InterviewAI</span>
      </div>
      <div className="navbar-right">
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
