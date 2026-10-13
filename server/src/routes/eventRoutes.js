const express = require('express');
const { validateEventPayload } = require('../middleware/validation');
const { postEvent } = require('../controllers/eventController');

const router = express.Router();

// POST /api/events - Ingest an analytics tracking event
router.post('/', validateEventPayload, postEvent);

module.exports = router;
