# Code Quality & Review

## Purpose

Review implementation quality before completion.

## Architecture

Check:

- architecture.md compliance
- correct layer
- correct file responsibility
- no unnecessary architecture changes

## Code

Check:

- naming
- readability
- duplication
- error handling
- validation
- async behavior
- unnecessary abstraction
- unnecessary dependencies

## Backend

Check:

- HTTP status codes
- input validation
- database queries
- pagination
- indexes
- duplicate prevention

## Frontend

Check:

- component responsibility
- loading state
- error state
- empty state
- API handling
- race conditions

## Tracker

Check:

- failure isolation
- non-blocking behavior
- unique event IDs
- session persistence
- privacy

## Important

Do not refactor working code merely for stylistic preference.

Prioritize correctness, maintainability, security, and architecture.
