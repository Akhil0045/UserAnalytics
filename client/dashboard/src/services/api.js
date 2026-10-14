/**
 * Centralized API service layer for CausalFunnel Analytics Dashboard.
 * All API URLs derive from import.meta.env.VITE_API_URL without hardcoded origins.
 * Includes Administrator Authentication token management and Bearer header injection.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing slash if present
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

const AUTH_TOKEN_KEY = 'cf_admin_token';

/**
 * Token management utilities
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (_) {}
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (_) {}
}

/**
 * Internal helper to inject Authorization Bearer headers
 */
function getAuthHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Administrator Login
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, token: string, user: Object }>}
 */
export async function loginAdmin(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed. Please check your credentials.');
  }

  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Verify current Administrator token session
 * @returns {Promise<{ authenticated: boolean, user?: Object }>}
 */
export async function verifyAdmin() {
  const token = getAuthToken();
  if (!token) {
    return { authenticated: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      clearAuthToken();
      return { authenticated: false };
    }

    const data = await response.json();
    return { authenticated: true, user: data.user };
  } catch (_) {
    return { authenticated: false };
  }
}

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
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('cf_auth_unauthorized'));
    }
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
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('cf_auth_unauthorized'));
    }
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
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('cf_auth_unauthorized'));
    }
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
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('cf_auth_unauthorized'));
    }
    throw new Error(errorBody.error || `Failed to fetch tracked pages (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    pages: data.pages || [],
    pagination: data.pagination || { page, limit, total: 0, total_pages: 1 }
  };
}
