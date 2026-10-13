const express = require('express');
const { getHeatmap } = require('../controllers/heatmapController');

const router = express.Router();

// GET /api/heatmap - Retrieve click coordinates for a specific page_url
router.get('/', getHeatmap);

module.exports = router;
