import { successResponse } from '../utils/response.js';

export const systemController = {
  /**
   * GET /api/v1/health
   * Public health check endpoint
   */
  getHealth(req, res) {
    return res.status(200).json(
      successResponse({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      })
    );
  },

  /**
   * POST /api/v1/simulate-error
   * Endpoint designed to deliberately trigger an uncaught server error
   * for verifying centralized 500 handling.
   */
  simulateError(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Simulated error endpoint is disabled in production mode.'
        }
      });
    }

    const error = new Error("Deliberately simulated internal server error for DecodeLabs Project 2 resilience test");
    error.status = 500;
    next(error);
  }
};
