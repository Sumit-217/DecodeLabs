import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requestLogger } from './middleware/logger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import taskRoutes from './routes/tasks.js';
import systemRoutes from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // 1. Request & Latency Logger
  app.use(requestLogger);

  // 2. Security Headers (Helmet with permissive CSP for Developer Studio)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  // 3. CORS Configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    })
  );

  // 4. Request Body Parsing with Size Limit
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 5. Rate Limiting Middleware (Autonomic Defense)
  app.use('/api/', rateLimiter);

  // 6. Serve OpenAPI Raw Specification
  app.get('/openapi.yaml', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../docs/openapi.yaml'));
  });

  // 7. Mount REST API Routes under /api/v1
  app.use('/api/v1', systemRoutes);
  app.use('/api/v1/tasks', taskRoutes);

  // 8. Serve Developer Studio & Static Assets from /public
  app.use(express.static(path.resolve(__dirname, '../public')));

  // Fallback for API documentation route
  app.get('/api/docs', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });

  // 9. 404 Catch-All Handler
  app.use(notFoundHandler);

  // 10. Centralized Global Error Handler
  app.use(errorHandler);

  return app;
}
