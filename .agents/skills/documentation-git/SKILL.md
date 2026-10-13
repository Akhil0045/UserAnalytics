# Documentation & Git Workflow

## Purpose

Keep the project submission-ready.

## README

README.md should contain:

- project overview
- features
- architecture
- technology stack
- folder structure
- setup instructions
- environment variables
- API documentation
- tracker usage
- dashboard usage
- MongoDB setup
- testing
- assumptions
- tradeoffs
- scalability notes

## Environment

Commit:

.env.example

Never commit:

.env

## Git Commits

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

## Rules

Do not combine unrelated features.

Do not commit secrets.

Keep README synchronized with implementation.
