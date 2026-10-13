# CausalFunnel User Analytics Application
## Original Assignment Requirements

This document records the original hiring assignment requirements.
It describes WHAT must be built. The implementation approach is defined separately in architecture.md.

---

## Objective

Build a simple full-stack user analytics application that tracks user interactions on a webpage and displays the collected analytics in a dashboard.

The application should demonstrate:

- Client-side event tracking
- Backend event ingestion
- MongoDB event storage
- Session-based analytics
- User journey visualization
- Click heatmap visualization
- Basic full-stack engineering practices

---

# 1. Event Tracking

Create a JavaScript tracking script that can be added to a webpage.

The tracker must record the following events:

### page_view

Triggered when a webpage is loaded.

### click

Triggered when the user clicks on the webpage.

---

## Required Event Information

Every event must contain:

- session_id
- event type
- page URL
- timestamp

Click events must additionally contain:

- click x coordinate
- click y coordinate

The tracking script must send events to the backend API.

---

# 2. Session Identification

A session identifier must be maintained on the client.

The session ID should persist while the user navigates between pages.

The implementation may use:

- cookies
- localStorage

The exact session strategy is defined in architecture.md.

---

# 3. Demo Website

A simple webpage may be created to demonstrate the tracking functionality.

The demo page should contain clickable elements so that click events can be generated and observed in the dashboard.

The demo website does not need to be a production ecommerce application.

---

# 4. Backend

The backend may be implemented using:

- Node.js
- Flask

The selected implementation is defined in architecture.md.

The backend must:

- receive tracking events
- validate events
- store events
- expose analytics APIs

---

# 5. Required APIs

The application must provide APIs for:

## Event ingestion

Receive and store tracking events.

## Sessions

Fetch sessions along with event counts.

## Session events

Fetch all events belonging to a particular session.

Events should be returned in chronological order.

## Heatmap

Fetch click data for a selected page.

The response should provide enough information for the frontend to visually display click positions.

---

# 6. Database

MongoDB should be used for structured event storage.

Events should contain enough information to support:

- session queries
- chronological event queries
- page-based click queries
- event counting

---

# 7. Dashboard

Build a React or Next.js dashboard.

The dashboard should provide at least two major capabilities.

---

## Sessions List

Display sessions with:

- session ID
- total event count

Clicking a session should open its event history.

---

## User Journey

Display the selected session's events in chronological order.

The dashboard should make the user's journey easy to understand.

Example:

1. page_view
2. click
3. click
4. page_view
5. click

---

## Heatmap

Provide a page selector.

For the selected page:

- retrieve click data
- display click positions visually
- provide a basic heatmap/click visualization

An advanced heatmap library is not required.

---

# 8. Hosting

Hosting is optional.

The application should work locally.

---

# 9. GitHub

The completed project should be suitable for publishing to a public GitHub repository.

---

# 10. README

The README should explain:

- project purpose
- architecture
- technology stack
- setup instructions
- environment variables
- how to run the application
- API overview
- assumptions
- tradeoffs
- limitations

---

# Assignment Completion Criteria

The project should demonstrate an end-to-end flow:

Browser
    ↓
Tracking Script
    ↓
Backend API
    ↓
MongoDB
    ↓
Dashboard

The implementation should remain simple, reliable, explainable, and appropriate for a hiring assignment.

Do not introduce unnecessary production infrastructure unless explicitly required.
