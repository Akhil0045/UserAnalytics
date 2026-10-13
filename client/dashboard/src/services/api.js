/**
 * Centralized API service layer for CausalFunnel Analytics Dashboard.
 * All API URLs derive from import.meta.env.VITE_API_URL without hardcoded origins.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing slash if present
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

/**
 * Fetch paginated list of sessions from GET /api/sessions
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=50]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ sessions: Array, pagination: Object }>}
 */
export async function getSessions({ page = 1, limit = 50, signal } = {}) {
  const url = `${API_BASE_URL}/api/sessions?page=${page}&limit=${limit}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch sessions (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    sessions: data.data || data.sessions || [],
    pagination: data.pagination || { page, limit, total: 0, total_pages: 1 }
  };
}

/**
 * Fetch ordered chronological events for a specific session from GET /api/sessions/:sessionId/events
 * @param {string} sessionId
 * @param {Object} options
 * @param {number} [options.limit=100]
 * @param {number} [options.offset=0]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ sessionId: string, events: Array, pagination: Object }>}
 */
export async function getSessionEvents(sessionId, { limit = 100, offset = 0, signal } = {}) {
  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  const url = `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionId)}/events?limit=${limit}&offset=${offset}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch session events (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    sessionId: data.session_id || sessionId,
    events: data.data || data.events || [],
    pagination: data.pagination || { limit, offset, total: 0 }
  };
}

/**
 * Fetch click coordinates for a given page URL from GET /api/heatmap?page_url=...
 * Correctly encodes the query URL parameter.
 * @param {string} pageUrl
 * @param {Object} options
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ pageUrl: string, clicks: Array }>}
 */
export async function getHeatmap(pageUrl, { signal } = {}) {
  if (!pageUrl) {
    throw new Error('pageUrl is required');
  }

  const encodedUrl = encodeURIComponent(pageUrl);
  const url = `${API_BASE_URL}/api/heatmap?page_url=${encodedUrl}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch heatmap data (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    pageUrl: data.page_url || pageUrl,
    clicks: data.data || data.clicks || []
  };
}

/**
 * Fetch aggregate performance metrics for all tracked pages from GET /api/pages
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=50]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ pages: Array, pagination: Object }>}
 */
export async function getPages({ page = 1, limit = 50, signal } = {}) {
  const url = `${API_BASE_URL}/api/pages?page=${page}&limit=${limit}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch tracked pages (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    pages: data.pages || [],
    pagination: data.pagination || { page, limit, total: 0, total_pages: 1 }
  };
}

