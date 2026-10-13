# CausalFunnel User Analytics Application — System Architecture

## 1. System Overview

The **CausalFunnel User Analytics Application** is a lightweight, full-stack analytics platform built as a hiring assignment. It tracks user interactions on web pages (page views and clicks) and displays actionable insights via an interactive React dashboard.

The end-to-end data flow:

```text
Target Web Page (Demo)
         ↓
    tracker.js (Client-side tracking)
         ↓ HTTP POST /api/events
Express API Server (Node.js)
         ↓ Mongoose
      MongoDB (Document Storage)
         ↓ HTTP REST APIs
React + Vite Dashboard (Visual Analytics)
```

---

## 2. Deployment Architecture

The application is architected for decoupled frontend and backend hosting to mirror real-world production environments:

```text
User Browser
   │
   ├── Demo Webpage / tracker.js
   │
   └── React Dashboard (Vercel)
          │
          │ HTTPS REST Requests
          ▼
     Node.js Express API (Railway)
          │
          │ MongoDB Connection URI
          ▼
     MongoDB Atlas (Cloud Database)
```

### Hosting Strategy

1. **Frontend (Vercel)**
   - Root Directory: `client/dashboard`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL` (points to the Railway backend in production, `http://localhost:5000` in development).

2. **Backend (Railway)**
   - Root Directory: `server`
   - Start Command: `npm start`
   - Bound Address: `0.0.0.0`
   - Port: Dynamically assigned via `process.env.PORT` (defaults to `5000` locally).
   - Environment Variables:
     - `PORT`: Provided by host environment.
     - `MONGODB_URI`: MongoDB Atlas connection string.
     - `CLIENT_ORIGIN`: Allowed frontend origin for CORS.

3. **Database (MongoDB Atlas)**
   - Managed cloud MongoDB instance.
   - Accessed securely via environment variable without committing credentials.

---

## 3. Technology Stack

### Frontend (`client/dashboard`)
- **Framework**: React 18 / 19
- **Build Tool**: Vite
- **Language**: JavaScript (ES Modules)
- **Styling**: Vanilla CSS
- **HTTP Client**: Native Fetch API (or Axios)
- *Explicitly Excluded*: TypeScript, Next.js, Redux, complex UI component libraries.

### Backend (`server`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: JavaScript (CommonJS / ES Modules)
- **Database Driver**: Mongoose (Phase 2+)
- **Security/Middleware**: CORS, Dotenv, express.json()
- *Explicitly Excluded*: TypeScript, NestJS, GraphQL, WebSockets, Kafka/Redis.

### Database (`MongoDB`)
- **Storage Engine**: MongoDB Atlas (production) / Local MongoDB (development)
- **Data Modeling**: Mongoose Schema with strict validation and targeted compound indexes.

### Tracker (`tracker/tracker.js`)
- **Implementation**: Vanilla JavaScript (no external libraries)
- **Session Mechanism**: `localStorage` (UUID generation and persistence)
- **Network**: Asynchronous Fetch API with failure isolation.

---

## 4. Project Directory Structure

```text
causalfunnel-analytics/
├── client/
│   └── dashboard/
│       ├── public/
│       ├── src/
│       │   ├── components/      # UI components (SessionList, Heatmap, etc.)
│       │   ├── pages/           # Page views (Dashboard)
│       │   ├── services/        # API communication (api.js)
│       │   ├── hooks/           # Custom React hooks
│       │   ├── App.jsx          # Root component
│       │   ├── main.jsx         # Entry point
│       │   └── index.css        # Stylesheet
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       ├── .env.example
│       └── .gitignore
│
├── server/
│   ├── src/
│   │   ├── config/              # Configuration (database.js in Phase 2)
│   │   ├── models/              # Mongoose models (Event.js in Phase 3)
│   │   ├── controllers/         # Request handlers (event, session, heatmap)
│   │   ├── routes/              # Express route declarations
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Error handling and validation middleware
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry point and port binding
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── tracker/
│   └── tracker.js               # Client tracking script (Phase 5)
│
├── demo/
│   └── index.html               # Demo webpage for tracking tests (Phase 6)
│
├── .agents/                     # Rules and skills for guided engineering
├── architecture.md              # Architectural source of truth
├── assignment.md                # Original assignment specifications
├── decisions.md                 # Architecture Decision Records (ADRs)
├── api-contract.md              # REST API contract specification
├── implementation-status.md     # Progress tracker across all phases
├── testing-checklist.md         # Comprehensive test matrix
├── README.md                    # Project documentation
├── .gitignore                   # Root Git ignore rules
└── package.json                 # Workspace orchestration scripts
```

---

## 5. Component Responsibilities & Ingestion Flow

1. **Client Tracker (`tracker.js`)**
   - Automatically initializes on page load.
   - Retrieves or generates a persistent `session_id` in `localStorage`.
   - Generates a UUID `event_id` per interaction.
   - Emits `page_view` on load.
   - Emits `click` with normalized coordinates (`x`, `y`, `viewport_width`, `viewport_height`).
   - Uses non-blocking asynchronous requests (`fetch`) wrapped in try-catch so the host page is never disrupted.

2. **Ingestion & Backend API (`server`)**
   - Validates event payload against schema constraints (rejects unknown event types or missing fields with `HTTP 400`).
   - Enforces idempotency via unique `event_id` index in MongoDB.
   - Appends server-side `received_at` timestamp.
   - Serves analytical queries for sessions, chronological user journeys, and aggregated click coordinates.
   - Serves `/api/health` for deployment readiness and uptime monitoring.

3. **React Dashboard (`client/dashboard`)**
   - Consumes analytical endpoints using configured `VITE_API_URL`.
   - Visualizes sessions, counts, timelines, and normalized heatmaps.
   - Handles loading, success, empty, and error states gracefully.

---

## 6. Security, Privacy & Reliability

- **No Sensitive Data**: The tracker will not capture form field inputs, keystrokes, passwords, or personal identifiable information (PII).
- **Environment Isolation**: No credentials or private URLs are committed to source control.
- **CORS Protection**: Configurable `CLIENT_ORIGIN` ensures controlled browser access.
- **Fail-Safe Tracker**: Tracker errors do not bubble up to the host application.

---

## 7. Production Scalability Evolution

For this hiring assignment, a clean monolithic Express backend with MongoDB is utilized. In a high-throughput production environment, the architecture can scale as follows:

```text
Browsers / Trackers
         ↓
  Edge Load Balancer (Cloudflare / ALB)
         ↓
  Ingestion Gateway (High-throughput API)
         ↓
  Message Broker (Kafka / AWS Kinesis / RabbitMQ)
         ↓
  Stream Workers (Validation & Enrichment)
         ↓
  Time-series / Analytical Store (ClickHouse / MongoDB Timeseries)
         ↓
  Query Service & Caching (Redis)
         ↓
  React Analytics Dashboard
```
