const eventService = require('../services/eventService');

/**
 * Controller handler for GET /api/sessions.
 * Returns paginated sessions aggregated from the Event collection.
 */
const listSessions = async (req, res, next) => {
  try {
    let page = 1;
    let limit = 50;

    if (req.query.page !== undefined) {
      page = Number(req.query.page);
      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid page parameter. Must be a positive integer'
        });
      }
    }

    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit parameter. Must be an integer between 1 and 100'
        });
      }
    }

    const result = await eventService.getSessions({ page, limit });

    res.status(200).json({
      success: true,
      data: result.sessions,
      sessions: result.sessions,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller handler for GET /api/sessions/:sessionId/events.
 * Returns ordered event history for a given session.
 */
const listSessionEvents = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0 || sessionId.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing sessionId parameter'
      });
    }

    let limit = 100;
    let offset = 0;

    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit parameter. Must be an integer between 1 and 200'
        });
      }
    }

    if (req.query.offset !== undefined) {
      offset = Number(req.query.offset);
      if (!Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid offset parameter. Must be a non-negative integer'
        });
      }
    }

    const result = await eventService.getSessionEvents(sessionId.trim(), { limit, offset });

    res.status(200).json({
      success: true,
      session_id: sessionId.trim(),
      data: result.events,
      events: result.events,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listSessions,
  listSessionEvents
};
