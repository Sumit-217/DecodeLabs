/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * HTTP Server Entry Point & Graceful Shutdown Lifecycle
 */

import dotenv from 'dotenv';
import app from './app.js';
import { initDb, closeDb } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

// Initialize Database Connection and WAL Journaling
try {
  initDb();
  console.log('[SQLite] Database connected & initialized with WAL mode.');
} catch (err) {
  console.error('[SQLite] Database initialization failed:', err);
  process.exit(1);
}

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`DecodeLabs Project 4 — Full Stack Server Active!`);
  console.log(`Frontend Application : http://localhost:${PORT}`);
  console.log(`REST API Health      : http://localhost:${PORT}/api/health`);
  console.log(`REST API Interns     : http://localhost:${PORT}/api/interns`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('[Server] HTTP connections closed.');
    closeDb();
    console.log('[SQLite] Database connection closed.');
    process.exit(0);
  });

  // Force shutdown if taking longer than 4 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 4000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
