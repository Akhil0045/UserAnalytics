# MongoDB Data Modeling

## Purpose

Implement efficient MongoDB storage for the analytics application.

## Event Document

Fields:

- event_id
- session_id
- event_type
- page_url
- timestamp
- received_at
- click
- createdAt
- updatedAt

## Click

Click events contain:

- x
- y
- viewport_width
- viewport_height

Page view events do not require click data.

## Required Indexes

Unique:

event_id

Compound:

session_id + timestamp

Compound:

event_type + page_url

## Rules

- Prevent duplicate event_id records.
- Validate schema values.
- Avoid arbitrary indexes.
- Avoid unbounded queries.
- Match indexes to API query patterns.
- Do not expose database credentials.

## Scalability

Keep the assignment MongoDB-only.

Do not introduce Redis, Kafka, or other infrastructure.

Document future scalability instead of implementing unnecessary infrastructure.
