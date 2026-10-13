const eventService = require('../services/eventService');

/**
 * Controller handler for GET /api/heatmap.
 * Returns click coordinates for a given page_url to render heatmaps.
 */
const getHeatmap = async (req, res, next) => {
  try {
    const { page_url } = req.query;

    if (!page_url || typeof page_url !== 'string' || page_url.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'page_url query parameter is required'
      });
    }

    const decodedUrl = page_url.trim();

    try {
      new URL(decodedUrl);
    } catch (_) {
      return res.status(400).json({
        success: false,
        error: 'page_url must be a valid URL string'
      });
    }

    const result = await eventService.getHeatmapClicks(decodedUrl);

    res.status(200).json({
      success: true,
      page_url: result.pageUrl,
      data: result.clicks,
      clicks: result.clicks
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHeatmap
};
