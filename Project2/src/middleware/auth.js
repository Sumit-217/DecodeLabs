import { errorResponse } from '../utils/response.js';

/**
 * Extract API token from Authorization header (Bearer ...) or x-api-key header
 * @param {object} req 
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1].trim();
    }
    return authHeader.trim();
  }

  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return apiKeyHeader.trim();
  }

  return null;
}

/**
 * Authentication Middleware (AuthN)
 * Verifies that the request has a valid user or admin API key.
 * If credentials are missing or invalid, responds with 401 Unauthorized.
 */
export function authenticate(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json(
      errorResponse(
        'UNAUTHORIZED',
        'Authentication required. Please provide a valid Bearer token or API key.'
      )
    );
  }

  const userKey = process.env.API_USER_KEY || 'demo-user-key';
  const adminKey = process.env.API_ADMIN_KEY || 'demo-admin-key';

  if (token === adminKey) {
    req.user = { role: 'admin', key: token };
    return next();
  }

  if (token === userKey) {
    req.user = { role: 'user', key: token };
    return next();
  }

  return res.status(401).json(
    errorResponse(
      'UNAUTHORIZED',
      'Invalid API key or token.'
    )
  );
}

/**
 * Authorization Middleware (AuthZ)
 * Enforces role-based permissions (e.g. requires 'admin')
 * Responds with 403 Forbidden if the authenticated user lacks permissions.
 * @param {string} requiredRole 
 */
export function requireRole(requiredRole) {
  return (req, res, next) => {
    // If not authenticated yet, trigger 401
    if (!req.user) {
      return res.status(401).json(
        errorResponse(
          'UNAUTHORIZED',
          'Authentication required before role verification.'
        )
      );
    }

    if (requiredRole === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json(
        errorResponse(
          'FORBIDDEN',
          'You do not have permission to perform this action.'
        )
      );
    }

    next();
  };
}
