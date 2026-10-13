# Backend API Development

## Purpose

Develop the Node.js + Express backend.

## Stack

- Node.js
- Express
- JavaScript
- Mongoose

## Responsibilities

Implement:

- Health API
- Event ingestion API
- Sessions API
- Session events API
- Heatmap API
- Validation
- Error handling
- Pagination

## Required APIs

GET /api/health

POST /api/events

GET /api/sessions

GET /api/sessions/:sessionId/events

GET /api/heatmap?page_url=<URL>

## Rules

Validate all client input.

Supported events:

- page_view
- click

Use correct HTTP status codes.

Use centralized error handling.

Do not expose stack traces.

Do not add unnecessary middleware.

## Testing

Test:

- valid requests
- invalid requests
- missing fields
- duplicate events
- pagination
- database failures
