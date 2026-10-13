const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint (Phase 1)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Never expose sensitive details, database credentials, or stack traces
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message
  });
});

module.exports = app;
