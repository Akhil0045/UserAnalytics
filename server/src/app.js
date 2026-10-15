const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const { requireAuth } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Flexible CORS configuration supporting CLIENT_ORIGIN (single, comma-separated, or Vercel preview domains)
const rawClientOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawClientOrigins.split(',').map((o) => o.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.startsWith('http://localhost') ||
      cleanOrigin.startsWith('http://127.0.0.1') ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

// Request body size limit (50 KB protection against oversized payloads)
app.use(express.json({ limit: '50kb' }));

// Serve demo store and tracker statically (supports both root and subfolder Railway/container paths)
const fs = require('fs');
const demoDir = [path.join(__dirname, '../demo'), path.join(__dirname, '../../demo')].find(p => fs.existsSync(p));
const trackerDir = [path.join(__dirname, '../tracker'), path.join(__dirname, '../../tracker')].find(p => fs.existsSync(p));

if (demoDir) app.use('/demo', express.static(demoDir));
if (trackerDir) app.use('/tracker', express.static(trackerDir));

// Health Check Endpoint (Preserved from Phase 1 & 2)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// Mount Public Ingestion & Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Mount Protected Analytics APIs (Requires Admin Authentication)
app.use('/api/sessions', requireAuth, sessionRoutes);
app.use('/api/heatmap', requireAuth, heatmapRoutes);
app.use('/api/pages', requireAuth, pageRoutes);

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
