# Architecture Decision Log

This file records important implementation decisions for the CausalFunnel analytics application.

The purpose is to prevent accidental architectural drift during development.

---

## ADR-001 - Frontend Framework

Decision:

Use React with Vite.

Reason:

- Required dashboard functionality fits React well.
- Vite provides simple development setup.
- No need for Next.js server-side rendering for this assignment.

---

## ADR-002 - Backend Framework

Decision:

Use Node.js with Express.

Reason:

- JavaScript can be used across frontend, backend, and tracker.
- Express is lightweight.
- Suitable for REST APIs required by the assignment.
- Easy to explain during an interview.

---

## ADR-003 - Database

Decision:

Use MongoDB with Mongoose.

Reason:

- Assignment explicitly requires MongoDB.
- Event documents are naturally represented as MongoDB documents.
- Mongoose provides schema validation and indexing support.

---

## ADR-004 - Session Storage

Decision:

Store session_id in browser localStorage.

Behavior:

- Generate a UUID when no session exists.
- Reuse the same session ID on page refresh.
- Reuse it when navigating between pages in the same browser profile.
- Clearing localStorage creates a new session.

Reason:

Simple and appropriate for the assignment.

Production systems could introduce inactivity-based session expiration.

---

## ADR-005 - Event Identifier

Decision:

Every event receives a client-generated unique event_id.

Reason:

Network requests can be retried or responses can be lost.

A unique database index on event_id provides practical idempotency.

This gives at-least-once delivery with duplicate prevention.

---

## ADR-006 - Event Types

Decision:

Only two event types are supported:

- page_view
- click

Unknown event types are rejected by the backend.

Reason:

These are the exact events required by the assignment.

---

## ADR-007 - Timestamp Strategy

Decision:

Store both client timestamp and server received_at.

Reason:

Client timestamp represents when the event occurred from the browser perspective.

received_at represents when the backend received the event.

This helps diagnose client clock differences and ingestion delays.

---

## ADR-008 - Click Coordinates

Decision:

Use event.clientX and event.clientY.

Coordinate system:

Viewport coordinates.

Reason:

The browser APIs directly provide these values and they are sufficient for the assignment.

Viewport width and height are also recorded.

---

## ADR-009 - Heatmap Normalization

Decision:

Store raw click coordinates and viewport dimensions.

For visualization, normalize:

normalized_x = x / viewport_width

normalized_y = y / viewport_height

Reason:

Users can have different viewport sizes.

Normalization allows click points to be displayed proportionally.

---

## ADR-010 - URL Storage

Decision:

Initially store the complete page URL.

Example:

https://example.com/products?id=123

Reason:

This preserves the exact page context.

Future production improvements may normalize URLs or separate pathname/query parameters.

---

## ADR-011 - Event Delivery

Decision:

Send events asynchronously using fetch.

Tracker failures must never break the host website.

Reason:

Analytics should be non-blocking and must not interfere with the webpage being tracked.

---

## ADR-012 - Offline Tracking

Decision:

Offline event persistence is out of scope.

Reason:

The assignment does not require offline analytics.

Future implementation could add a local event queue and retry mechanism.

---

## ADR-013 - Pagination

Decision:

Use pagination for session and event APIs.

Reason:

A session or analytics dataset can grow large.

The dashboard should not request unlimited records.

---

## ADR-014 - Database Indexes

Required indexes:

1. Unique event_id
2. session_id + timestamp
3. event_type + page_url

Reason:

These indexes match the main query patterns.

---

## ADR-015 - Authentication

Decision:

No authentication or authorization.

Reason:

Authentication is not required by the assignment.

Adding auth would increase implementation complexity without improving the required functionality.

---

## ADR-016 - Real-Time Updates

Decision:

No WebSockets.

Reason:

The assignment does not require real-time dashboard updates.

REST APIs are sufficient.

---

## ADR-017 - Scalability

Decision:

Build the assignment with a simple monolithic backend while keeping the data model scalable.

Future production architecture could introduce:

Browser
→ Load Balancer
→ Event API
→ Message Queue
→ Event Workers
→ Analytics Store
→ Query Layer
→ Dashboard

Do not implement this infrastructure for the assignment.

---

## ADR-018 - Privacy

Decision:

Do not collect:

- passwords
- form values
- keystrokes
- personal information
- sensitive user data
- device fingerprinting information
- IP/geographic tracking

Reason:

The assignment only requires page views and clicks.

---

## ADR-019 - Error Handling

Decision:

Invalid client requests return HTTP 400.

Unexpected backend errors return appropriate 5xx responses.

Tracker errors are isolated from the host page.

Frontend displays loading, empty, success, and error states.

---

## ADR-020 - Development Strategy

Decision:

Implement the project in small phases.

The agent must not build multiple future phases automatically.

After each phase:

- test
- inspect
- review
- update status
- stop

Reason:

This reduces accidental complexity and makes debugging easier.
