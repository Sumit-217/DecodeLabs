/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * Express Application Factory & Middleware Pipeline
 * Serves both the REST API and the Frontend SPA from the same process.
 */

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import internsRouter from './routes/interns.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve Static Frontend Assets (HTML, CSS, JS)
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

// Mount REST API
app.use('/api', internsRouter);

// Fallback to SPA index.html for non-API client routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `API route ${req.method} ${req.url} does not exist.`
      }
    });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
