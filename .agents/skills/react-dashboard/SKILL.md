# React Dashboard Development

## Purpose

Build the analytics dashboard using React + Vite.

## Main Features

### Sessions

Display:

- session_id
- total event count

### User Journey

When a session is selected:

- Fetch events.
- Display chronological events.
- Distinguish page_view and click.

### Heatmap

Provide:

- page selector
- click visualization
- click positions

## Required UI States

Every API-driven component must handle:

- loading
- success
- empty
- error

## Components

Expected components:

- SessionList
- SessionDetails
- EventTimeline
- Heatmap
- PageSelector

## Rules

- Keep components focused.
- Avoid unnecessary state libraries.
- Avoid unnecessary API requests.
- Handle race conditions.
- Do not hard-code backend URLs.
- Use VITE_API_URL.

## Testing

Verify:

- empty sessions
- session selection
- event timeline
- API errors
- heatmap page changes
- loading states
