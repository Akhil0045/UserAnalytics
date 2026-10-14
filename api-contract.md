# API Contract

This document defines the contract between:

- Client Tracker
- Backend API
- React Dashboard
- MongoDB data layer

The API contract should be treated as stable unless intentionally changed.

---

# Base URL

Development:

http://localhost:<PORT>/api

The frontend should obtain the API URL from:

VITE_API_URL

---

# 1. Health Check

## Request

GET /api/health

## Response

HTTP 200

```json
{
  "status": "ok"
}
```

---

# 2. Event Ingestion

## Request

POST /api/events

Content-Type:

application/json

Example:

```json
{
  "event_id": "evt_123",
  "session_id": "sess_123",
  "event_type": "page_view",
  "page_url": "http://localhost:5173/",
  "timestamp": "2026-10-13T10:00:00.000Z"
}
```

Click example:

```json
{
  "event_id": "evt_124",
  "session_id": "sess_123",
  "event_type": "click",
  "page_url": "http://localhost:5173/",
  "timestamp": "2026-10-13T10:00:05.000Z",
  "click": {
    "x": 532,
    "y": 241,
    "viewport_width": 1920,
    "viewport_height": 1080
  }
}
```

---

## Success

HTTP 201

```json
{
  "success": true,
  "event_id": "evt_123"
}
```

---

## Validation Failure

HTTP 400

Example:

```json
{
  "success": false,
  "error": "Invalid event payload"
}
```

---

## Duplicate Event

The same event_id must not create multiple database records.

The implementation may return a successful idempotent response or an appropriate conflict response, but duplicate records must never be created.

---

# 3. Sessions

## Request

GET /api/sessions?page=1&limit=50

---

## Response

Example:

```json
{
  "success": true,
  "data": [
    {
      "session_id": "sess_123",
      "event_count": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50
  }
}
```

The exact metadata may be extended if required.

---

# 4. Session Events

## Request

GET /api/sessions/:sessionId/events?limit=100&offset=0

---

## Response

Example:

```json
{
  "success": true,
  "data": [
    {
      "event_id": "evt_123",
      "session_id": "sess_123",
      "event_type": "page_view",
      "page_url": "http://localhost:5173/",
      "timestamp": "2026-10-13T10:00:00.000Z"
    },
    {
      "event_id": "evt_124",
      "session_id": "sess_123",
      "event_type": "click",
      "page_url": "http://localhost:5173/",
      "timestamp": "2026-10-13T10:00:05.000Z",
      "click": {
        "x": 532,
        "y": 241,
        "viewport_width": 1920,
        "viewport_height": 1080
      }
    }
  ]
}
```

Events must be ordered:

timestamp ASC

---

# 5. Heatmap

## Request

GET /api/heatmap?page_url=<encoded-url>

Example:

GET /api/heatmap?page_url=http%3A%2F%2Flocalhost%3A5173%2F

---

## Response

Example:

```json
{
  "success": true,
  "page_url": "http://localhost:5173/",
  "data": [
    {
      "x": 532,
      "y": 241,
      "viewport_width": 1920,
      "viewport_height": 1080
    }
  ]
}
```

Only click events should be returned.

---

# 6. Tracked Pages Analytics

## Request

GET /api/pages?page=1&limit=50

---

## Response

Example:

```json
{
  "success": true,
  "pages": [
    {
      "page_url": "http://localhost:5000/demo/index.html",
      "views_count": 24,
      "clicks_count": 86,
      "total_events": 110,
      "unique_sessions": 12,
      "first_seen": "2026-10-13T10:00:00.000Z",
      "last_seen": "2026-10-13T11:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "total_pages": 1
  }
}
```

---

# 7. Admin Authentication

Analytics inspection endpoints (`/api/sessions`, `/api/heatmap`, `/api/pages`) are protected and require a Bearer token in the `Authorization` header. Event ingestion (`POST /api/events`) and health check (`GET /api/health`) remain public.

## Login Request

POST /api/auth/login

Content-Type: application/json

```json
{
  "username": "admin",
  "password": "your-password"
}
```

## Login Success

HTTP 200

```json
{
  "success": true,
  "token": "<jwt-token>",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

## Verify Token Request

GET /api/auth/me

Headers:
`Authorization: Bearer <jwt-token>`

## Verify Token Success

HTTP 200

```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "admin",
    "login_time": "2026-10-14T16:58:52.095Z",
    "exp": 1792083532095
  }
}
```

## Unauthorized Response

HTTP 401

```json
{
  "success": false,
  "error": "Authentication required. Please log in as an administrator to view analytics."
}
```

---

# Event Data Contract

## Required

event_id

Type:

string

---

session_id

Type:

string

---

event_type

Allowed:

- page_view
- click

---

page_url

Type:

string

Must be a valid URL.

---

timestamp

Type:

ISO-compatible date/time.

---

# Click Data Contract

Required for click events:

x

y

viewport_width

viewport_height

All values must be finite numbers.

Coordinates must be within reasonable viewport limits.

---

# Error Contract

Backend errors should follow a predictable structure.

Example:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Unexpected errors should not expose:

- database credentials
- stack traces
- internal implementation details

---

# Pagination Rules

Sessions:

?page=<number>&limit=<number>

Session events:

?limit=<number>&offset=<number>

The backend must enforce a maximum limit.

Clients must not be allowed to request unlimited records.

---

# API Design Rules

1. Validate every client-supplied value.
2. Never trust tracker data.
3. Keep response structures predictable.
4. Avoid returning unnecessary fields.
5. Avoid huge responses.
6. Maintain chronological ordering for session events.
7. Keep dashboard and tracker dependent only on documented contracts.
