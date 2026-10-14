/**
 * CausalFunnel Analytics Tracker (tracker.js)
 * Lightweight, non-blocking vanilla JavaScript client tracking script.
 * 
 * Features:
 * - Persistent session management via localStorage
 * - Unique event_id generation per interaction
 * - Automatic page_view event on initialization
 * - Global click tracking capturing viewport coordinates
 * - Non-blocking asynchronous network delivery with failure isolation
 * - Zero sensitive data collection (no keystrokes, passwords, or PII)
 */
(function () {
  'use strict';

  // Prevent multiple initializations on the same page
  if (window.__CAUSALFUNNEL_TRACKER_INITIALIZED__) {
    return;
  }
  window.__CAUSALFUNNEL_TRACKER_INITIALIZED__ = true;

  var STORAGE_KEY = 'causalfunnel_session_id';

  /**
   * Resolves the API endpoint URL.
   * Priority:
   * 1. <script data-api-url="..."> attribute on current script tag
   * 2. window.__ANALYTICS_API_URL__ global variable
   * 3. Fallback default to local development endpoint
   */
  function getApiUrl() {
    try {
      var currentScript = document.currentScript || document.querySelector('script[data-api-url]');
      if (currentScript && currentScript.getAttribute('data-api-url')) {
        return currentScript.getAttribute('data-api-url');
      }
      if (window.__ANALYTICS_API_URL__) {
        return window.__ANALYTICS_API_URL__;
      }
    } catch (_) {
      // Ignore DOM inspection failures
    }
    // Dynamic fallback: Use production Railway API if running in production domain
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://useranalytics-production.up.railway.app/api/events';
    }
    return 'http://localhost:5000/api/events';
  }

  /**
   * Generates a compliant RFC4122 v4 UUID.
   * Uses native crypto.randomUUID() when available, with a pseudo-random fallback.
   */
  function generateUUID() {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch (_) {}

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Retrieves or creates a persistent session identifier stored in localStorage.
   * Reuses the session_id across page refreshes and same-domain navigations.
   */
  function getSessionId() {
    try {
      var existing = localStorage.getItem(STORAGE_KEY);
      if (existing && typeof existing === 'string' && existing.trim().length > 0) {
        return existing;
      }
      var newSessionId = generateUUID();
      localStorage.setItem(STORAGE_KEY, newSessionId);
      return newSessionId;
    } catch (_) {
      // In case localStorage is blocked or restricted (e.g. private mode)
      if (!window.__causalfunnel_fallback_session_id) {
        window.__causalfunnel_fallback_session_id = generateUUID();
      }
      return window.__causalfunnel_fallback_session_id;
    }
  }

  /**
   * Sends an analytics payload asynchronously to the backend API.
   * Failures are isolated completely so the host page is never disrupted.
   */
  function sendEvent(eventType, extraData) {
    try {
      var payload = {
        event_id: generateUUID(),
        session_id: getSessionId(),
        event_type: eventType,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      };

      if (eventType === 'click' && extraData && extraData.click) {
        payload.click = extraData.click;
      }

      var endpoint = getApiUrl();

      // Send asynchronously via fetch
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function (networkErr) {
        // Graceful failure isolation: log lightweight debug notice in development without throwing
        if (window.console && window.console.debug) {
          window.console.debug('[CausalFunnel Tracker] Ingestion failed:', networkErr.message || networkErr);
        }
      });
    } catch (err) {
      // Catch any unexpected client-side error so host website is never broken
      if (window.console && window.console.debug) {
        window.console.debug('[CausalFunnel Tracker] Error sending event:', err.message || err);
      }
    }
  }

  /**
   * Track initial page_view on load
   */
  function trackPageView() {
    sendEvent('page_view');
  }

  /**
   * Track user clicks across the document
   */
  function initClickTracking() {
    document.addEventListener('click', function (event) {
      try {
        // Collect click coordinates and viewport dimensions
        var clickData = {
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
          viewport_width: Math.round(window.innerWidth || document.documentElement.clientWidth || 0),
          viewport_height: Math.round(window.innerHeight || document.documentElement.clientHeight || 0)
        };

        sendEvent('click', { click: clickData });
      } catch (err) {
        // Never allow tracker click listener errors to bubble up or block page interactions
      }
    }, true); // Use capture phase to record clicks accurately
  }

  // Initialize tracker
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        trackPageView();
      });
    } else {
      trackPageView();
    }
    initClickTracking();
  } catch (initErr) {
    // Failure isolation
  }
})();
