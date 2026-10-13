const eventService = require('../services/eventService');

/**
 * Controller handler for GET /api/pages.
 * Returns aggregate metrics for all tracked URLs (views, clicks, sessions).
 * Enforces pagination with bounds [1, 100].
 */
const getPages = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    // Default values if omitted
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = 50;
    }

    // Enforce strict upper bound of 100 items per page
    if (limit > 100) {
      limit = 100;
    }

    const result = await eventService.getTrackedPages({ page, limit });

    res.status(200).json({
      success: true,
      pages: result.pages,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPages
};
