// Ensure crypto and WebCrypto are globally available in all environments
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

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Does not expose credentials or connection strings in logs.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI environment variable is missing or empty.');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

/**
 * Disconnects from MongoDB cleanly.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
