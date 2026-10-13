const express = require('express');
const { listSessions, listSessionEvents } = require('../controllers/sessionController');

const router = express.Router();

// GET /api/sessions - List aggregated sessions
router.get('/', listSessions);

// GET /api/sessions/:sessionId/events - Retrieve chronological events for a session
router.get('/:sessionId/events', listSessionEvents);

module.exports = router;
