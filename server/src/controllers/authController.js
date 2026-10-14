const { generateToken } = require('../middleware/auth');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Handle Administrator Login
 * Validates credentials and returns a secure session token.
 */
function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Constant-time-like or safe equality comparison
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password. Please verify your credentials.'
    });
  }

  const token = generateToken({
    username: ADMIN_USERNAME,
    role: 'admin',
    login_time: new Date().toISOString()
  });

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      username: ADMIN_USERNAME,
      role: 'admin'
    }
  });
}

/**
 * Verify Current Admin Session
 */
function getMe(req, res) {
  return res.status(200).json({
    success: true,
    authenticated: true,
    user: req.user
  });
}

module.exports = {
  login,
  getMe
};
