const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Public login endpoint
router.post('/login', authController.login);

// Protected session check
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
