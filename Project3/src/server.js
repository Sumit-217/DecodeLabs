import dotenv from 'dotenv';
import { createApp } from './app.js';
import { closeDb } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`[Project 3 Server] Listening on http://localhost:${PORT}`);
  console.log(`[Project 3 Database] Connected and initialized`);
  console.log(`[Project 3 API] Endpoint: http://localhost:${PORT}/api/items`);
});

// Graceful shutdown handling
function shutdown() {
  console.log('\n[Project 3 Server] Shutting down gracefully...');
  server.close(() => {
    closeDb();
    console.log('[Project 3 Database] Connection closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { server, app };
