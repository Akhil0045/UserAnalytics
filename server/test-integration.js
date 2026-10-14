/**
 * CausalFunnel Integration Test Suite
 * Validates the complete backend ingestion and analytics pipeline:
 * 1. Health check (GET /api/health)
 * 2. Ingest Page View event (POST /api/events)
 * 3. Ingest Click event with coordinates & viewport (POST /api/events)
 * 4. Idempotency test: Re-ingest same event_id without duplicate creation
 * 5. Aggregated Sessions query (GET /api/sessions)
 * 6. Chronological Session Events query (GET /api/sessions/:sessionId/events)
 * 7. Heatmap Coordinates query (GET /api/heatmap?page_url=...)
 * 8. Multi-Page Flow query (GET /api/pages)
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function runIntegrationTests() {
  console.log(`\n========================================`);
  console.log(`🚀 Starting CausalFunnel Integration Tests`);
  console.log(`📡 Target API: ${API_BASE}`);
  console.log(`========================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      if (details) console.error('     Details:', details);
      failed++;
    }
  }

  const testSessionId = `test-integration-${Date.now()}`;
  const testPageUrl = 'http://localhost:5000/demo/product.html?id=headphones';
  const pvEventId = `pv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const clickEventId = `cl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // 1. Health API
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    assert(
      res.status === 200 && data.status === 'ok' && data.database === 'connected',
      'GET /api/health returns ok status and connected database'
    );
  } catch (err) {
    assert(false, 'GET /api/health threw error', err.message);
  }

  // 1b. Auth Guard: Unauthenticated requests to protected endpoints return 401
  try {
    const res = await fetch(`${API_BASE}/api/sessions`);
    assert(
      res.status === 401,
      'GET /api/sessions without Authorization header is rejected with HTTP 401'
    );
  } catch (err) {
    assert(false, 'Unauthenticated /api/sessions guard threw error', err.message);
  }

  // 1c. Admin Login & Token Acquisition
  let authToken = null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    authToken = data.token;
    assert(
      res.status === 200 && data.success === true && Boolean(data.token) && data.user?.username === 'admin',
      'POST /api/auth/login succeeds with admin credentials and issues Bearer token'
    );
  } catch (err) {
    assert(false, 'POST /api/auth/login threw error', err.message);
  }

  const authHeaders = { Authorization: `Bearer ${authToken}` };

  // 1d. Token Verification: GET /api/auth/me
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders });
    const data = await res.json();
    assert(
      res.status === 200 && data.authenticated === true && data.user?.username === 'admin',
      'GET /api/auth/me validates Bearer token'
    );
  } catch (err) {
    assert(false, 'GET /api/auth/me threw error', err.message);
  }

  // 2. Ingest Page View
  try {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: pvEventId,
        session_id: testSessionId,
        event_type: 'page_view',
        page_url: testPageUrl,
        timestamp: new Date().toISOString()
      })
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.success === true && data.event_id === pvEventId,
      'POST /api/events ingests page_view with HTTP 201'
    );
  } catch (err) {
    assert(false, 'POST /api/events page_view threw error', err.message);
  }

  // 3. Ingest Click Event
  try {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: clickEventId,
        session_id: testSessionId,
        event_type: 'click',
        page_url: testPageUrl,
        timestamp: new Date().toISOString(),
        click: {
          x: 210,
          y: 350,
          viewport_width: 1280,
          viewport_height: 720
        }
      })
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.success === true && data.event_id === clickEventId,
      'POST /api/events ingests click with viewport coordinates with HTTP 201'
    );
  } catch (err) {
    assert(false, 'POST /api/events click threw error', err.message);
  }

  // 4. Duplicate Event Idempotency
  try {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: clickEventId,
        session_id: testSessionId,
        event_type: 'click',
        page_url: testPageUrl,
        timestamp: new Date().toISOString(),
        click: {
          x: 210,
          y: 350,
          viewport_width: 1280,
          viewport_height: 720
        }
      })
    });
    const data = await res.json();
    assert(
      (res.status === 200 || res.status === 201) && Boolean(data.duplicate || data.success),
      'POST /api/events handles duplicate event_id idempotently without throwing error'
    );
  } catch (err) {
    assert(false, 'POST /api/events duplicate idempotency threw error', err.message);
  }

  // 5. Query GET /api/sessions
  try {
    const res = await fetch(`${API_BASE}/api/sessions`, { headers: authHeaders });
    const data = await res.json();
    const session = data.sessions?.find((s) => s.session_id === testSessionId);
    assert(
      res.status === 200 && Boolean(session) && session.event_count === 2,
      'GET /api/sessions aggregates test session with correct event_count = 2',
      session
    );
  } catch (err) {
    assert(false, 'GET /api/sessions threw error', err.message);
  }

  // 6. Query GET /api/sessions/:sessionId/events
  try {
    const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(testSessionId)}/events`, { headers: authHeaders });
    const data = await res.json();
    const hasPv = data.events?.some((e) => e.event_id === pvEventId && e.event_type === 'page_view');
    const hasClick = data.events?.some((e) => e.event_id === clickEventId && e.event_type === 'click' && e.click?.x === 210);
    assert(
      res.status === 200 && data.events?.length === 2 && hasPv && hasClick,
      'GET /api/sessions/:sessionId/events returns all session events chronologically',
      { count: data.events?.length }
    );
  } catch (err) {
    assert(false, 'GET /api/sessions/:sessionId/events threw error', err.message);
  }

  // 7. Query GET /api/heatmap?page_url=...
  try {
    const res = await fetch(`${API_BASE}/api/heatmap?page_url=${encodeURIComponent(testPageUrl)}`, { headers: authHeaders });
    const data = await res.json();
    const clickFound = data.clicks?.some((c) => c.x === 210 && c.y === 350 && c.viewport_width === 1280);
    assert(
      res.status === 200 && clickFound,
      'GET /api/heatmap?page_url=... returns ingested click coordinates and viewport',
      { totalClicks: data.total_clicks }
    );
  } catch (err) {
    assert(false, 'GET /api/heatmap threw error', err.message);
  }

  // 8. Query GET /api/pages
  try {
    const res = await fetch(`${API_BASE}/api/pages`, { headers: authHeaders });
    const data = await res.json();
    const pageFound = data.pages?.find((p) => p.page_url === testPageUrl);
    assert(
      res.status === 200 && Boolean(pageFound) && pageFound.views_count >= 1 && pageFound.clicks_count >= 1,
      'GET /api/pages aggregates multi-page views, clicks, and session metrics',
      pageFound
    );
  } catch (err) {
    assert(false, 'GET /api/pages threw error', err.message);
  }

  console.log(`\n========================================`);
  console.log(`📊 Integration Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests();
