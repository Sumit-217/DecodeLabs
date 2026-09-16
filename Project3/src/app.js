import express from 'express';
import cors from 'cors';
import { initDb } from './database/db.js';
import itemsRouter from './routes/items.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(customDbPath = null) {
  // Initialize database connection and schema
  initDb(customDbPath);

  const app = express();

  // Middleware pipeline
  app.use(cors());
  app.use(express.json());

  // Health and Info endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      project: 'DecodeLabs Project 3 — Database Integration',
      timestamp: new Date().toISOString()
    });
  });

  // Simple root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'DecodeLabs Project 3 — Database Integration API',
      documentation: '/api/items'
    });
  });

  // Resource routes
  app.use('/api/items', itemsRouter);

  // Error handling pipeline
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
