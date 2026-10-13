# Testing & Edge Case Validation

## Purpose

Ensure features are actually verified.

## Event Tests

Test:

- missing event_id
- missing session_id
- missing event_type
- invalid event_type
- invalid URL
- invalid timestamp
- duplicate event_id
- invalid coordinates
- invalid viewport dimensions
- missing click data
- oversized payload

## Session Tests

Test:

- no sessions
- one session
- multiple sessions
- invalid session ID
- pagination
- pagination boundaries
- maximum limit

## Heatmap Tests

Test:

- no clicks
- one click
- multiple clicks
- different viewport sizes
- different pages
- invalid page URL

## Tracker Tests

Test:

- first visit
- refresh
- multiple clicks
- API unavailable
- slow API
- duplicate submission

## Frontend Tests

Test:

- loading
- empty response
- API error
- rapid session changes
- rapid page changes

## Rule

A feature is not complete until relevant edge cases are considered and tested.
