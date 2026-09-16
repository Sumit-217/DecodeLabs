import 'dotenv/config';
import { createApp } from './app.js';
import { initDb } from './data/db.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize persistence storage
initDb();

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ DecodeLabs Project 2 — Backend API ("The Nervous System")`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📊 Developer Studio:  http://localhost:${PORT}/`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`📑 OpenAPI Spec:      http://localhost:${PORT}/openapi.yaml`);
  console.log(`🩺 Health Endpoint:   http://localhost:${PORT}/api/v1/health`);
  console.log(`📋 Tasks Endpoint:    http://localhost:${PORT}/api/v1/tasks`);
  console.log(`=======================================================`);
});

/**
 * Graceful server shutdown handling
 */
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  server.close((err) => {
    if (err) {
      console.error('[Server] Error during graceful shutdown:', err);
      process.exit(1);
    }
    console.log('[Server] Connections closed. Shutdown complete.');
    process.exit(0);
  });

  // Force exit if shutdown hangs beyond 5 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
