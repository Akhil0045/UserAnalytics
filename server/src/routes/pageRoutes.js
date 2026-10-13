const express = require('express');
const { getPages } = require('../controllers/pageController');

const router = express.Router();

// GET /api/pages - List all tracked pages with aggregate metrics
router.get('/', getPages);

module.exports = router;
