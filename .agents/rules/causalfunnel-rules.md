# CausalFunnel Analytics - Global Agent Rules

## 1. SOURCE OF TRUTH

`architecture.md` is the primary source of truth.

Before changing code:

1. Read architecture.md.
2. Identify the current development phase.
3. Inspect the existing implementation.
4. Follow the defined architecture.
5. Do not redesign the architecture without explicit justification.

If architecture.md conflicts with an implementation request, stop and report the conflict.

---

## 2. DEVELOPMENT MUST BE IN PHASES

NEVER build the entire application in one task.

Follow this order:

1. Project initialization
2. MongoDB connection
3. Event model
4. Event ingestion API
5. Client tracker
6. Demo website
7. Sessions API
8. Session events API
9. Heatmap API
10. Sessions dashboard
11. User journey
12. Heatmap UI
13. Integration testing
14. Edge-case testing
15. Documentation

Only implement the current requested phase.

DO NOT build future phases automatically.

---

## 3. INSPECT BEFORE MODIFYING

Before modifying any file:

- Inspect the project structure.
- Read architecture.md.
- Read relevant existing files.
- Check package.json.
- Check environment configuration.
- Understand existing implementation.

Never overwrite existing code blindly.

---

## 4. KEEP TASKS SMALL

Every task should be independently:

- Implementable
- Testable
- Reviewable
- Committable

Do not combine unrelated features.

---

## 5. TECHNOLOGY STACK

Use the following stack unless explicitly instructed otherwise.

Frontend:

- React
- Vite
- JavaScript
- CSS

Backend:

- Node.js
- Express
- JavaScript
- Mongoose

Database:

- MongoDB

Tracker:

- Vanilla JavaScript

---

## 6. DO NOT OVERENGINEER

Do NOT introduce:

- Kafka
- RabbitMQ
- Redis
- Kubernetes
- Microservices
- GraphQL
- Elasticsearch
- WebSockets
- Redux unless required
- TypeScript unless requested
- Authentication unless requested

This is a hiring assignment.

Prefer:

Simple
Correct
Maintainable
Testable
Explainable

---

## 7. EVENT TYPES

Only these event types are supported:

- page_view
- click

Unknown event types must be rejected.

---

## 8. REQUIRED EVENT FIELDS

Every event requires:

- event_id
- session_id
- event_type
- page_url
- timestamp

Click events additionally require:

- x
- y
- viewport_width
- viewport_height

---

## 9. EVENT IDEMPOTENCY

Every event must have a unique event_id.

MongoDB must enforce uniqueness.

Duplicate event submissions must not create duplicate records.

---

## 10. TIMESTAMPS

Store both:

- client timestamp
- server received_at

Do not replace client timestamp with server timestamp.

---

## 11. TRACKER SAFETY

The tracker must NEVER break the host website.

It must:

- Be asynchronous.
- Never block page execution.
- Handle API failures gracefully.
- Generate/reuse session_id.
- Generate unique event_id.
- Track page_view.
- Track click.

Do not collect:

- passwords
- form values
- keystrokes
- personal information
- sensitive information

---

## 12. SESSION

Use localStorage.

First visit:

1. Generate UUID.
2. Store UUID.
3. Reuse UUID.

Do not implement automatic session expiration unless explicitly requested.

---

## 13. HEATMAP

Click coordinates use viewport coordinates:

- clientX
- clientY

Store:

- x
- y
- viewport_width
- viewport_height

Normalization:

normalized_x = x / viewport_width

normalized_y = y / viewport_height

Never assume a fixed viewport size.

---

## 14. DATABASE INDEXES

Required indexes:

- unique event_id
- session_id + timestamp
- event_type + page_url

Do not create arbitrary indexes.

Indexes must have a query/use-case justification.

---

## 15. API CONTRACT

Required endpoints:

GET /api/health

POST /api/events

GET /api/sessions

GET /api/sessions/:sessionId/events

GET /api/heatmap?page_url=<URL>

Do not rename endpoints without explicit approval.

---

## 16. PAGINATION

Never return unlimited records.

Sessions and session event APIs must support pagination.

Always enforce a reasonable maximum limit.

---

## 17. BACKEND VALIDATION

All browser data is untrusted.

Validate:

- IDs
- event type
- URL
- timestamp
- coordinates
- viewport dimensions
- payload size

Invalid input should return an appropriate 4xx response.

---

## 18. FRONTEND STATES

API-driven UI must support:

- Loading
- Success
- Empty
- Error

Prevent stale responses from overwriting newer UI state.

---

## 19. ENVIRONMENT VARIABLES

Never hard-code:

- MongoDB credentials
- secrets
- environment-specific API URLs

Use:

`.env`

Commit:

`.env.example`

Never commit:

`.env`

---

## 20. SECURITY

Never expose:

- database credentials
- internal stack traces
- sensitive user data

Treat all browser input as untrusted.

Do not permanently use unrestricted CORS in production.

---

## 21. ERROR HANDLING

Backend errors must be handled centrally where practical.

Do not silently swallow errors.

Do not expose internal implementation details to clients.

Use appropriate HTTP status codes.

---

## 22. TEST AFTER EVERY TASK

After every implementation:

1. Start the relevant application.
2. Test the feature.
3. Test at least one invalid/edge case.
4. Inspect the result.
5. Fix failures.
6. Review changed files.

Never declare success only because the code compiles.

---

## 23. SELF REVIEW

Before finishing a task ask:

- Does this match architecture.md?
- Did I modify only necessary files?
- Did I add unnecessary dependencies?
- Are errors handled?
- Are edge cases handled?
- Did I break existing functionality?
- Is this easy to explain in an interview?

---

## 24. NO UNREQUESTED CHANGES

Do not:

- Rewrite unrelated files.
- Rename working APIs.
- Replace working libraries unnecessarily.
- Remove working functionality.
- Add unrelated features.

---

## 25. GIT

Use focused commits.

Examples:

feat: initialize project structure
feat: add mongodb connection
feat: add event model
feat: add event ingestion api
feat: add client tracking script
feat: add demo website
feat: add sessions api
feat: add session events api
feat: add heatmap api
feat: add sessions dashboard
feat: add user journey
feat: add heatmap visualization
test: add edge case validation
docs: update readme

Do not create one giant commit.

---

## 26. STOP CONDITION

Stop and ask for clarification when:

- Requirements conflict.
- architecture.md is ambiguous.
- A major architecture change is needed.
- A new technology is required.
- A destructive change is required.

Do not silently make major architectural decisions.

---

## 27. DEFINITION OF DONE

A task is complete only when:

- Implementation is complete.
- Acceptance criteria are satisfied.
- Tests pass.
- Edge cases are considered.
- Existing functionality still works.
- Architecture is respected.
- No unnecessary dependencies were added.
- Changes are ready for commit.

---

## 28. MOST IMPORTANT RULE

DO NOT BUILD AHEAD.

Implement ONLY the current requested task.

After completion report:

1. What was implemented.
2. Files changed.
3. Tests performed.
4. Test results.
5. Issues discovered.
6. Recommended next phase.

Then STOP.
