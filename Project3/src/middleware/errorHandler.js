/**
 * Centralized error handling middleware for Project 3.
 * Catches errors, formats response, and prevents application crashes.
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err.message || err);

  // Handle SQLite constraint violations
  if (err.message && err.message.includes('CHECK constraint failed')) {
    return res.status(400).json({
      success: false,
      error: 'Data constraint validation failed: invalid values provided'
    });
  }

  if (err.message && err.message.includes('NOT NULL constraint failed')) {
    return res.status(400).json({
      success: false,
      error: 'Required database field missing'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

/**
 * 404 Handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}
