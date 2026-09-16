import { errorResponse } from '../utils/response.js';

/**
 * 404 Not Found Middleware for unhandled routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json(
    errorResponse(
      'NOT_FOUND',
      `Endpoint ${req.method} ${req.originalUrl || req.url} does not exist.`
    )
  );
}

/**
 * Centralized Error Handling Middleware
 * Catches all errors passed down from controllers, routers, or parsers.
 */
export function errorHandler(err, req, res, next) {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Malformed JSON body in request payload.'
      )
    );
  }

  // Handle PayloadTooLargeError from body-parser
  if (err.type === 'entity.too.large') {
    return res.status(413).json(
      errorResponse(
        'PAYLOAD_TOO_LARGE',
        'Request entity exceeds the maximum allowed payload size limit.'
      )
    );
  }

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // In production or test, mask internal error details
  let clientMessage = "An unexpected internal server error occurred.";
  let errorCode = "INTERNAL_SERVER_ERROR";

  if (statusCode === 400) {
    errorCode = "VALIDATION_ERROR";
    clientMessage = err.message || "Invalid request.";
  } else if (statusCode === 401) {
    errorCode = "UNAUTHORIZED";
    clientMessage = err.message || "Unauthorized.";
  } else if (statusCode === 403) {
    errorCode = "FORBIDDEN";
    clientMessage = err.message || "Forbidden.";
  } else if (statusCode === 404) {
    errorCode = "NOT_FOUND";
    clientMessage = err.message || "Resource not found.";
  } else if (statusCode === 429) {
    errorCode = "RATE_LIMIT_EXCEEDED";
    clientMessage = err.message || "Too many requests.";
  }

  // Development logging
  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[Server Error] ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  const response = errorResponse(errorCode, clientMessage);

  // If development mode and status is 500, we can attach debug message (without leaking outside dev)
  if (isDev && statusCode === 500) {
    response.error.debugMessage = err.message;
  }

  return res.status(statusCode).json(response);
}
