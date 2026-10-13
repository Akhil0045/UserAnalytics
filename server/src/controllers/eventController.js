const eventService = require('../services/eventService');

/**
 * Controller handler for POST /api/events.
 * Receives validated request and delegates to eventService.
 */
const postEvent = async (req, res, next) => {
  try {
    const result = await eventService.ingestEvent(req.body);

    // If it was an existing duplicate event, return 200 idempotent success
    // If it was newly created, return 201 Created
    const statusCode = result.duplicate ? 200 : 201;

    res.status(statusCode).json({
      success: true,
      event_id: result.event_id
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postEvent
};
