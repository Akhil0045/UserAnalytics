import React, { useState } from 'react';
import { loginAdmin } from '../services/api';

/**
 * Admin Login Component
 * Provides secure authentication to view restricted analytics data.
 * Includes 1-click credential prefill for assignment reviewers.
 */
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loginAdmin(username, password);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="login-backdrop">
      <div className="login-card">
        {/* Logo and Header */}
        <div className="login-header">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="login-title">CausalFunnel Analytics</h2>
          <p className="login-subtitle">Administrator Portal · Analytics Access</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-sm"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Unlock Analytics Dashboard →</span>
            )}
          </button>
        </form>

        {/* Reviewer Demo Credentials Helper */}
        <div className="reviewer-hint-box">
          <div className="hint-header">
            <span>🔑 <strong>Reviewer Default Credentials:</strong></span>
          </div>
          <div className="hint-credentials">
            <code>admin</code> / <code>admin123</code>
          </div>
          <button
            type="button"
            className="btn-prefill"
            onClick={fillDemoCredentials}
            title="Auto-fill demo credentials"
          >
            Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
