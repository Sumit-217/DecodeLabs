import { errorResponse } from '../utils/response.js';

// In-memory store: Map<ip, { count: number, resetTime: number }>
const requestCounts = new Map();

/**
 * Reset in-memory rate limiter store (useful for tests)
 */
export function resetRateLimiter() {
  requestCounts.clear();
}

/**
 * Configurable in-memory rate limiting middleware
 */
export function rateLimiter(req, res, next) {
  // Allow bypassing rate limiter if explicitly requested in test config
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return next();
  }

  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10);

  // Identify client by IP (considering X-Forwarded-For if proxied)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let clientRecord = requestCounts.get(clientIp);

  if (!clientRecord || now > clientRecord.resetTime) {
    clientRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    requestCounts.set(clientIp, clientRecord);
  } else {
    clientRecord.count += 1;
  }

  const remaining = Math.max(0, maxRequests - clientRecord.count);
  const resetSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetSeconds);

  if (clientRecord.count > maxRequests) {
    res.setHeader('Retry-After', resetSeconds);
    return res.status(429).json(
      errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.'
      )
    );
  }

  next();
}
