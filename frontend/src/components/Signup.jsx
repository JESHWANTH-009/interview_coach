import React, { useState } from 'react';
import './Signup.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Signup({ onSignupSuccess, onToggleView }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: email,
        password: password,
        display_name: `${firstName} ${lastName}`.trim(),
      });
      onSignupSuccess(response.data.uid, response.data.email);
    } catch (err) {
      setError(err.response ? err.response.data.detail || 'Signup failed.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google signup logic would go here if supported by backend

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of developers preparing for success</p>
        </div>
        <button className="google-signin-btn" type="button" disabled>
          <span className="google-icon">
            {/* Official Google G SVG */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M21.805 11.227c0-.781-.07-1.563-.217-2.32H11.22v4.395h5.98a5.13 5.13 0 0 1-2.227 3.37v2.797h3.602c2.11-1.945 3.23-4.813 3.23-8.242z" fill="#4285F4"/>
                <path d="M11.22 22c2.917 0 5.372-.969 7.163-2.633l-3.602-2.797c-1.008.68-2.297 1.086-3.561 1.086-2.74 0-5.063-1.852-5.898-4.344H1.62v2.844A10.98 10.98 0 0 0 11.22 22z" fill="#34A853"/>
                <path d="M5.322 13.312A6.573 6.573 0 0 1 4.97 11c0-.805.145-1.586.352-2.312V5.844H1.62A10.98 10.98 0 0 0 .22 11c0 1.797.43 3.5 1.4 5.156l3.702-2.844z" fill="#FBBC05"/>
                <path d="M11.22 4.344c1.594 0 3.016.547 4.14 1.617l3.11-3.11C16.59 1.016 14.137 0 11.22 0A10.98 10.98 0 0 0 1.62 5.844l3.702 2.844c.836-2.492 3.16-4.344 5.898-4.344z" fill="#EA4335"/>
              </g>
            </svg>
          </span>
          <span className="google-btn-text">Continue with Google</span>
        </button>
        <div className="divider">
          <span>OR CONTINUE WITH</span>
        </div>
        <form className="auth-form" onSubmit={handleSignup}>
          {error && <div className="auth-error">{error}</div>}
          <div className="input-row">
            <div className="input-group">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="given-name"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="auth-input"
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="auth-input"
              autoComplete="new-password"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="auth-input"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          <span>Already have an account? </span>
          <button className="auth-link" onClick={onToggleView}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;