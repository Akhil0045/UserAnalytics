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

- [x] Valid MongoDB URI connects successfully
- [x] Invalid URI produces a clear error
- [x] Database connection failure does not silently pass
- [x] Environment variables are loaded correctly

---

# 3. Event Model

## Valid page_view

- [x] event_id accepted
- [x] session_id accepted
- [x] page_url accepted
- [x] timestamp accepted

## Valid click

- [x] click x accepted
- [x] click y accepted
- [x] viewport width accepted
- [x] viewport height accepted

## Invalid data

- [x] Missing event_id rejected
- [x] Missing session_id rejected
- [x] Missing event_type rejected
- [x] Missing page_url rejected
- [x] Missing timestamp rejected
- [x] Invalid event_type rejected
- [ ] Invalid URL rejected
- [ ] Invalid coordinate rejected
- [ ] Negative viewport dimensions rejected
- [x] Duplicate event_id prevented

---

# 4. Event API

- [x] POST /api/events works
- [x] Valid page_view returns 201
- [x] Valid click returns 201
- [x] Invalid payload returns 400
- [x] Duplicate event does not create duplicate record
- [x] received_at is generated server-side
- [x] Unexpected database errors are handled
- [x] Response does not expose internal errors

---

# 5. Tracker

- [x] First page generates session_id
- [x] session_id is stored in localStorage
- [x] Page refresh keeps session_id
- [x] Navigation keeps session_id
- [x] page_view fires once per page load
- [x] click event is generated
- [x] click x coordinate is correct
- [x] click y coordinate is correct
- [x] viewport dimensions are captured
- [x] event_id is unique
- [x] Tracker does not block webpage interaction
- [x] Tracker failure does not break webpage
- [x] Network failure does not break webpage

---

# 6. Demo Website

- [x] Page loads
- [x] Tracker loads
- [x] page_view reaches backend
- [x] Clicking buttons creates click events
- [x] Multiple clicks create separate events
- [x] Refresh creates another page_view
- [x] Same session ID is reused

---

# 7. Sessions API

- [x] Sessions are returned
- [x] Event counts are correct
- [x] Sessions can be paginated
- [x] Maximum limit is enforced
- [x] Empty database returns valid empty response
- [x] Invalid pagination values are handled

---

# 8. Session Events API

- [x] Valid session returns events
- [x] Events are ordered by timestamp ascending
- [x] Click data is returned for click events
- [x] page_view data is returned correctly
- [x] Empty session returns valid response
- [x] Pagination works
- [x] Invalid session ID is handled

---

# 9. Heatmap API

- [x] Valid page URL returns click data
- [x] Only click events are returned
- [x] page_view events are excluded
- [x] URL query parameter works
- [x] URL encoding works
- [x] Empty page returns empty result
- [x] Coordinates are returned correctly
- [x] Viewport dimensions are available

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
