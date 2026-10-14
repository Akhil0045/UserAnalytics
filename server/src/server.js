// Ensure crypto and WebCrypto are globally available in all Node.js environments (Railway/container)
const nodeCrypto = require('crypto');
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = nodeCrypto.webcrypto || nodeCrypto;
}
if (typeof global.crypto === 'undefined') {
  global.crypto = globalThis.crypto;
}
try {
  for (const [key, val] of Object.entries(nodeCrypto)) {
    if (typeof globalThis.crypto[key] === 'undefined') {
      globalThis.crypto[key] = typeof val === 'function' ? val.bind(nodeCrypto) : val;
    }
  }
} catch (e) {}

require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

let server;

const startServer = async () => {
  try {
    // 1. Establish database connection before accepting traffic
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(PORT, HOST, () => {
      console.log(`Backend server running on http://${HOST}:${PORT}`);
      console.log(`Health endpoint: http://${HOST}:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server and database connection`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await disconnectDB();
        console.log('MongoDB connection closed cleanly');
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err.message);
      }
      process.exit(0);
    });
  } else {
    try {
      await disconnectDB();
    } catch (_) {}
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
