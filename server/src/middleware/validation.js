/**
 * Validates incoming event ingestion payloads for POST /api/events.
 * Ensures data integrity before reaching the service/persistence layer.
 */
const validateEventPayload = (req, res, next) => {
  const { event_id, session_id, event_type, page_url, timestamp, click } = req.body || {};

  // 1. event_id validation
  if (!event_id || typeof event_id !== 'string' || event_id.trim().length === 0 || event_id.length > 128) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing event_id'
    });
  }

  // 2. session_id validation
  if (!session_id || typeof session_id !== 'string' || session_id.trim().length === 0 || session_id.length > 128) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing session_id'
    });
  }

  // 3. event_type validation
  if (!event_type || !['page_view', 'click'].includes(event_type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid event_type. Allowed values are: page_view, click'
    });
  }

  // 4. page_url validation
  if (!page_url || typeof page_url !== 'string' || page_url.trim().length === 0 || page_url.length > 2048) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing page_url'
    });
  }

  try {
    new URL(page_url);
  } catch (_) {
    return res.status(400).json({
      success: false,
      error: 'page_url must be a valid URL string'
    });
  }

  // 5. timestamp validation
  if (!timestamp || isNaN(Date.parse(timestamp))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing timestamp. Must be a valid date/time string'
    });
  }

  // 6. Click payload validation (if event_type is 'click')
  if (event_type === 'click') {
    if (!click || typeof click !== 'object' || Array.isArray(click)) {
      return res.status(400).json({
        success: false,
        error: 'click object is required for click events'
      });
    }

    const { x, y, viewport_width, viewport_height } = click;

    if (typeof x !== 'number' || !Number.isFinite(x) || x < 0) {
      return res.status(400).json({
        success: false,
        error: 'click.x must be a non-negative finite number'
      });
    }

    if (typeof y !== 'number' || !Number.isFinite(y) || y < 0) {
      return res.status(400).json({
        success: false,
        error: 'click.y must be a non-negative finite number'
      });
    }

    if (typeof viewport_width !== 'number' || !Number.isFinite(viewport_width) || viewport_width <= 0) {
      return res.status(400).json({
        success: false,
        error: 'click.viewport_width must be a positive finite number'
      });
    }

    if (typeof viewport_height !== 'number' || !Number.isFinite(viewport_height) || viewport_height <= 0) {
      return res.status(400).json({
        success: false,
        error: 'click.viewport_height must be a positive finite number'
      });
    }
  }

  next();
};

module.exports = {
  validateEventPayload
};
