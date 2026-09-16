/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * Centralized Error Handling Middleware
 * Maps SQLite exceptions and application errors into uniform JSON envelopes.
 */

export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev && err.status !== 404) {
    console.error(`[ErrorHandler] [${req.method} ${req.url}]`, err.message || err);
  }

  // Handle SQLite UNIQUE constraint (Duplicate email)
  if (err.message && err.message.includes('UNIQUE constraint failed: interns.email')) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'An intern with this email address already exists. Please provide a unique email.'
      }
    });
  }

  // Handle SQLite CHECK constraint (Invalid track, status, length)
  if (err.message && err.message.includes('CHECK constraint failed')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database check constraint failed. Please verify name length (min 2), role, track, and status.'
      }
    });
  }

  // Handle SQLite NOT NULL constraint
  if (err.message && err.message.includes('NOT NULL constraint failed')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUIRED_FIELD',
        message: 'A required field was omitted.'
      }
    });
  }

  // Custom HTTP status passed via error object
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected server error occurred.'
    }
  });
}
