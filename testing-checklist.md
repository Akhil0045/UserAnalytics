# Testing Checklist

This document contains the verification checklist for the CausalFunnel analytics application.

Every phase should perform relevant tests before moving forward.

---

# 1. Project Initialization

- [x] React project starts successfully
- [x] Backend project starts successfully
- [x] Required directories exist
- [x] No unnecessary dependencies
- [x] .env is ignored
- [x] .env.example exists
- [x] architecture.md remains unchanged
- [x] .agents directory remains intact

---

# 2. MongoDB

- [ ] Valid MongoDB URI connects successfully
- [ ] Invalid URI produces a clear error
- [ ] Database connection failure does not silently pass
- [ ] Environment variables are loaded correctly

---

# 3. Event Model

## Valid page_view

- [ ] event_id accepted
- [ ] session_id accepted
- [ ] page_url accepted
- [ ] timestamp accepted

## Valid click

- [ ] click x accepted
- [ ] click y accepted
- [ ] viewport width accepted
- [ ] viewport height accepted

## Invalid data

- [ ] Missing event_id rejected
- [ ] Missing session_id rejected
- [ ] Missing event_type rejected
- [ ] Missing page_url rejected
- [ ] Missing timestamp rejected
- [ ] Invalid event_type rejected
- [ ] Invalid URL rejected
- [ ] Invalid coordinate rejected
- [ ] Negative viewport dimensions rejected
- [ ] Duplicate event_id prevented

---

# 4. Event API

- [ ] POST /api/events works
- [ ] Valid page_view returns 201
- [ ] Valid click returns 201
- [ ] Invalid payload returns 400
- [ ] Duplicate event does not create duplicate record
- [ ] received_at is generated server-side
- [ ] Unexpected database errors are handled
- [ ] Response does not expose internal errors

---

# 5. Tracker

- [ ] First page generates session_id
- [ ] session_id is stored in localStorage
- [ ] Page refresh keeps session_id
- [ ] Navigation keeps session_id
- [ ] page_view fires once per page load
- [ ] click event is generated
- [ ] click x coordinate is correct
- [ ] click y coordinate is correct
- [ ] viewport dimensions are captured
- [ ] event_id is unique
- [ ] Tracker does not block webpage interaction
- [ ] Tracker failure does not break webpage
- [ ] Network failure does not break webpage

---

# 6. Demo Website

- [ ] Page loads
- [ ] Tracker loads
- [ ] page_view reaches backend
- [ ] Clicking buttons creates click events
- [ ] Multiple clicks create separate events
- [ ] Refresh creates another page_view
- [ ] Same session ID is reused

---

# 7. Sessions API

- [ ] Sessions are returned
- [ ] Event counts are correct
- [ ] Sessions can be paginated
- [ ] Maximum limit is enforced
- [ ] Empty database returns valid empty response
- [ ] Invalid pagination values are handled

---

# 8. Session Events API

- [ ] Valid session returns events
- [ ] Events are ordered by timestamp ascending
- [ ] Click data is returned for click events
- [ ] page_view data is returned correctly
- [ ] Empty session returns valid response
- [ ] Pagination works
- [ ] Invalid session ID is handled

---

# 9. Heatmap API

- [ ] Valid page URL returns click data
- [ ] Only click events are returned
- [ ] page_view events are excluded
- [ ] URL query parameter works
- [ ] URL encoding works
- [ ] Empty page returns empty result
- [ ] Coordinates are returned correctly
- [ ] Viewport dimensions are available

---

# 10. Dashboard - Sessions

- [ ] Dashboard loads
- [ ] Sessions are displayed
- [ ] Event counts are displayed
- [ ] Loading state works
- [ ] Empty state works
- [ ] Error state works
- [ ] Clicking a session selects it

---

# 11. Dashboard - User Journey

- [ ] Selected session events load
- [ ] Events appear chronologically
- [ ] page_view is distinguishable
- [ ] click is distinguishable
- [ ] Page URL is displayed
- [ ] Timestamp is displayed
- [ ] Click coordinates are displayed
- [ ] Loading state works
- [ ] Empty state works
- [ ] Error state works

---

# 12. Dashboard - Heatmap

- [ ] Page selector loads available pages
- [ ] Selecting a page fetches its clicks
- [ ] Click points render correctly
- [ ] Different viewport sizes are normalized
- [ ] Empty pages show an empty state
- [ ] Loading state works
- [ ] Error state works
- [ ] Changing page does not display stale results

---

# 13. Integration Testing

Complete end-to-end flow:

Browser
↓
tracker.js
↓
POST /api/events
↓
MongoDB
↓
GET /api/sessions
↓
GET /api/sessions/:sessionId/events
↓
GET /api/heatmap
↓
React dashboard

Checklist:

- [ ] Full flow works
- [ ] Data is persisted correctly
- [ ] Session count matches events
- [ ] Journey matches stored events
- [ ] Heatmap matches stored clicks

---

# 14. Edge Cases

## Session

- [ ] localStorage unavailable
- [ ] localStorage contains invalid session ID
- [ ] session ID is reused correctly
- [ ] multiple browser tabs behave acceptably

## Events

- [ ] Rapid clicks
- [ ] Duplicate event submission
- [ ] Very long URL
- [ ] Invalid timestamp
- [ ] Future timestamp
- [ ] Extremely large coordinate
- [ ] Negative coordinate
- [ ] Zero viewport dimensions
- [ ] Oversized payload
- [ ] Unknown event type

## Network

- [ ] Backend unavailable
- [ ] Request timeout
- [ ] Slow API
- [ ] Failed event submission
- [ ] Dashboard API unavailable

## Dashboard

- [ ] No sessions
- [ ] Session with one event
- [ ] Session with many events
- [ ] No clicks
- [ ] No pages
- [ ] Rapid session selection
- [ ] Rapid heatmap page selection

---

# 15. Security / Privacy

- [ ] MongoDB credentials never reach frontend
- [ ] .env is not committed
- [ ] .env.example contains placeholders only
- [ ] Backend validates client data
- [ ] No passwords are tracked
- [ ] No form values are tracked
- [ ] No keystrokes are tracked
- [ ] No personal information is intentionally collected
- [ ] Production CORS is restricted
- [ ] Error responses do not expose secrets

---

# 16. Performance

- [ ] Session API is paginated
- [ ] Session event API is paginated
- [ ] Database indexes exist
- [ ] Dashboard does not request unnecessary data
- [ ] Tracker is lightweight
- [ ] Tracker requests are asynchronous
- [ ] Large responses are avoided

---

# 17. Final Review

Before final submission:

- [ ] Architecture matches architecture.md
- [ ] Assignment requirements are satisfied
- [ ] API contract matches implementation
- [ ] All tests pass
- [ ] Edge cases reviewed
- [ ] No unnecessary dependencies
- [ ] No debug code
- [ ] No secrets committed
- [ ] README is complete
- [ ] Setup instructions work on a clean environment
- [ ] Git history contains focused commits
- [ ] Repository structure is clean

---

# Definition of Done

The project is complete only when:

1. Events can be generated in the browser.
2. Events reach the backend.
3. Events are stored in MongoDB.
4. Sessions can be queried.
5. Session journeys can be viewed.
6. Click data can be visualized as a heatmap.
7. Validation and error handling work.
8. Required indexes exist.
9. Pagination works.
10. Edge cases have been tested.
11. Documentation is complete.
12. The implementation remains consistent with architecture.md.
