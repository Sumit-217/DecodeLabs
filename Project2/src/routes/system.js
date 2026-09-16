import { Router } from 'express';
import { systemController } from '../controllers/systemController.js';

const router = Router();

/**
 * GET /api/v1/health
 * Public health check endpoint
 */
router.get('/health', systemController.getHealth);

/**
 * POST /api/v1/simulate-error
 * Internal error simulation endpoint for verifying centralized 500 handling
 */
router.post('/simulate-error', systemController.simulateError);

export default router;
