const Event = require('../models/Event');

/**
 * Service to persist an analytics event with server-side received_at timestamp
 * and database-level idempotency duplicate handling.
 * 
 * @param {Object} eventData Validated event payload from request
 * @returns {Promise<{ success: boolean, event_id: string, duplicate: boolean }>}
 */
const ingestEvent = async (eventData) => {
  const { event_id, session_id, event_type, page_url, timestamp, click } = eventData;

  const eventDoc = new Event({
    event_id,
    session_id,
    event_type,
    page_url,
    timestamp: new Date(timestamp),
    received_at: new Date(), // Generated server-side, never trusted from client
    click: event_type === 'click' ? click : undefined
  });

  try {
    const saved = await eventDoc.save();
    return {
      success: true,
      event_id: saved.event_id,
      duplicate: false
    };
  } catch (err) {
    // Check for MongoDB duplicate key error code 11000 on event_id unique index
    if (err.code === 11000) {
      return {
        success: true,
        event_id,
        duplicate: true
      };
    }

    // Re-throw unexpected errors to centralized handler
    throw err;
  }
};

/**
 * Derives session records from the Event collection using database aggregation.
 * Calculates event counts, first_seen, and last_seen timestamps with pagination.
 * 
 * @param {Object} options
 * @param {number} options.page Page number (1-based)
 * @param {number} options.limit Number of items per page
 * @returns {Promise<{ sessions: Array, pagination: Object }>}
 */
const getSessions = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $group: {
        _id: '$session_id',
        event_count: { $sum: 1 },
        first_seen: { $min: '$timestamp' },
        last_seen: { $max: '$timestamp' }
      }
    },
    {
      $sort: { last_seen: -1 } // Order most recent sessions first
    },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        paginatedResults: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              session_id: '$_id',
              event_count: 1,
              first_seen: 1,
              last_seen: 1
            }
          }
        ]
      }
    }
  ];

  const [result] = await Event.aggregate(pipeline);

  const total = result.totalCount.length > 0 ? result.totalCount[0].count : 0;
  const sessions = result.paginatedResults || [];
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages
    }
  };
};

/**
 * Retrieves all events for a given session in chronological order (timestamp ASC).
 * Leverages the compound index (session_id, timestamp).
 * 
 * @param {string} sessionId
 * @param {Object} options
 * @param {number} options.limit Number of events to return
 * @param {number} options.offset Number of events to skip
 * @returns {Promise<{ sessionId: string, events: Array, pagination: Object }>}
 */
const getSessionEvents = async (sessionId, { limit = 100, offset = 0 } = {}) => {
  const [events, total] = await Promise.all([
    Event.find({ session_id: sessionId })
      .sort({ timestamp: 1 })
      .skip(offset)
      .limit(limit)
      .select('-_id event_id session_id event_type page_url timestamp click')
      .lean(),
    Event.countDocuments({ session_id: sessionId })
  ]);

  return {
    sessionId,
    events,
    pagination: {
      limit,
      offset,
      total
    }
  };
};

/**
 * Retrieves click data for a specific page URL to generate heatmap visualizations.
 * Filters strictly by event_type='click' and leverages compound index (event_type, page_url).
 * 
 * @param {string} pageUrl
 * @returns {Promise<{ pageUrl: string, clicks: Array }>}
 */
const getHeatmapClicks = async (pageUrl) => {
  const events = await Event.find({
    event_type: 'click',
    page_url: pageUrl
  })
    .select('-_id click.x click.y click.viewport_width click.viewport_height')
    .lean();

  const clicks = events
    .map(e => e.click)
    .filter(c => c && typeof c.x === 'number' && typeof c.y === 'number');

  return {
    pageUrl,
    clicks
  };
};

/**
 * Retrieves aggregate statistics for all tracked pages.
 * Aggregates views_count, clicks_count, total_events, unique_sessions, and last_seen.
 * Supports pagination.
 * 
 * @param {Object} options
 * @param {number} options.page Page number (1-based)
 * @param {number} options.limit Items per page
 * @returns {Promise<{ pages: Array, pagination: Object }>}
 */
const getTrackedPages = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $group: {
        _id: '$page_url',
        views_count: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
        },
        clicks_count: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
        },
        total_events: { $sum: 1 },
        sessions: { $addToSet: '$session_id' },
        last_seen: { $max: '$timestamp' },
        first_seen: { $min: '$timestamp' }
      }
    },
    {
      $project: {
        _id: 0,
        page_url: '$_id',
        views_count: 1,
        clicks_count: 1,
        total_events: 1,
        unique_sessions: { $size: '$sessions' },
        first_seen: 1,
        last_seen: 1
      }
    },
    {
      $sort: { total_events: -1 }
    },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        paginatedResults: [
          { $skip: skip },
          { $limit: limit }
        ]
      }
    }
  ];

  const [result] = await Event.aggregate(pipeline);

  const total = result.totalCount.length > 0 ? result.totalCount[0].count : 0;
  const pages = result.paginatedResults || [];
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    pages,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages
    }
  };
};

module.exports = {
  ingestEvent,
  getSessions,
  getSessionEvents,
  getHeatmapClicks,
  getTrackedPages
};

