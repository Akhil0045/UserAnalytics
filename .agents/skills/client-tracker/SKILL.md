# Client Tracker Development

## Purpose

Build the lightweight browser analytics tracker.

## File

tracker/tracker.js

## Events

Track:

- page_view
- click

## Session

Use localStorage.

If session_id does not exist:

1. Generate UUID.
2. Store it.

Reuse it for subsequent events.

## Event ID

Generate a unique event_id for every event.

## Page View

Send:

- event_id
- session_id
- event_type
- page_url
- timestamp

## Click

Send:

- event_id
- session_id
- event_type
- page_url
- timestamp
- x
- y
- viewport_width
- viewport_height

Coordinates:

event.clientX

event.clientY

## Failure Isolation

The tracker must never break the host website.

Requests must be asynchronous.

Network failures must be handled safely.

Do not block normal webpage execution.

## Privacy

Never collect:

- passwords
- form values
- keystrokes
- personal information
- sensitive data

## Tests

Verify:

- first load creates session
- refresh reuses session
- click generates event
- every event has unique event_id
- API failure does not break page
