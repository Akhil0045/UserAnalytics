# CausalFunnel User Analytics Application

## Overview

The **CausalFunnel User Analytics Application** is a full-stack web analytics application designed to capture client-side user interactions (page views and clicks) and provide visualization and exploration of user sessions, user journeys, and click heatmaps via an interactive React dashboard.

---

## Current Status

**Current Phase**: Phase 1 — Project Initialization  
**Status**: Ready for verification

Foundational project structure, decoupled frontend, Express backend foundation with `/api/health`, and deployment configurations for Vercel and Railway have been established.

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Tooling**: Vite
- **Language**: JavaScript (ES Modules)
- **Styling**: Vanilla CSS

### Backend
- **Platform**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (CommonJS)

### Database *(Planned for Phase 2 & 3)*
- **Database**: MongoDB (Local development) / MongoDB Atlas (Production)
- **Object Modeling**: Mongoose

### Tracker *(Planned for Phase 5)*
- **Script**: Vanilla JavaScript (`tracker.js`)
- **Storage**: `localStorage` session persistence

### Deployment Target
- **Frontend**: Vercel (Root: `client/dashboard`, output: `dist`)
- **Backend**: Railway (Root: `server`, port binding: `0.0.0.0:$PORT`)
- **Database**: MongoDB Atlas

---

## Directory Structure

```text
causalfunnel-analytics/
├── client/
│   └── dashboard/          # React + Vite frontend application
│       ├── src/            # Source code (components, pages, services, hooks)
│       ├── public/         # Static assets
│       ├── package.json    # Frontend dependencies and build scripts
│       ├── vite.config.js  # Vite bundler configuration
│       └── .env.example    # Frontend environment variable template
│
├── server/
│   ├── src/                # Express backend application
│   │   ├── config/         # Configuration (database setup in Phase 2)
│   │   ├── models/         # Data models (Event schema in Phase 3)
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Validation and error handling
│   │   ├── app.js          # Express app definition & CORS configuration
│   │   └── server.js       # Server bootstrap and port listener
│   ├── package.json        # Backend dependencies and scripts
│   └── .env.example        # Backend environment variable template
│
├── tracker/                # Client-side tracking script (Phase 5)
├── demo/                   # Demo website for event generation (Phase 6)
│
├── .agents/                # Project rules and engineering skills
├── architecture.md         # System architecture document (Source of Truth)
├── assignment.md           # Assignment requirements specification
├── decisions.md            # Architecture Decision Records (ADRs)
├── api-contract.md         # REST API contract definition
├── implementation-status.md# Phase-by-phase implementation tracker
├── testing-checklist.md    # Test checklist and edge case validation
└── README.md               # Project documentation
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended; developed on Node v24)
- npm (v9 or higher)

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd server
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Start the backend server:

```bash
# Production mode
npm start

# Development watch mode
npm run dev
```

The backend starts on `http://localhost:5000` (or the port specified in `PORT`).

Verify the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok"}
```

---

### 2. Frontend Setup

Navigate to the dashboard directory and install dependencies:

```bash
cd client/dashboard
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Start the Vite development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

Build for production:

```bash
npm run build
```

---

## Implemented Endpoints (Phase 1)

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/health` | Service health check | Implemented |

*All analytics endpoints (`POST /api/events`, `GET /api/sessions`, `GET /api/sessions/:sessionId/events`, `GET /api/heatmap`) are planned for subsequent phases according to the implementation roadmap.*

---

## Deployment Configuration

- **Frontend (Vercel)**:
  - Framework Preset: Vite
  - Root Directory: `client/dashboard`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_URL` set to the production Railway backend URL.

- **Backend (Railway)**:
  - Root Directory: `server`
  - Start Command: `npm start`
  - Port: Dynamically provided by Railway via `process.env.PORT`.
  - Environment Variables:
    - `CLIENT_ORIGIN`: Allowed Vercel frontend domain.
    - `MONGODB_URI`: MongoDB Atlas connection string (Phase 2+).
