/**
 * Centralized error-handling middleware.
 * Formats errors uniformly without leaking internal server/database details.
 */
const errorHandler = (err, req, res, next) => {
  // Log internal error on the server for diagnostics
  console.error('[Error Handler]', err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
