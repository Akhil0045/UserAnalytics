const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration supporting CLIENT_ORIGIN and local development origins
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) or allowed origin or local dev origins
    if (
      !origin ||
      origin === clientOrigin ||
      origin === 'null' ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Request body size limit (50 KB protection against oversized payloads)
app.use(express.json({ limit: '50kb' }));

// Health Check Endpoint (Preserved from Phase 1 & 2)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// Mount Analytics and Ingestion API Routes
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/heatmap', heatmapRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
