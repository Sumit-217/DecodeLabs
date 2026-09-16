import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default database path: data/db.json relative to project root
const defaultDbPath = path.resolve(__dirname, '../../data/db.json');

let currentDbPath = process.env.DB_FILE_PATH || defaultDbPath;

const defaultData = {
  tasks: [
    {
      id: 1,
      title: "Build REST API",
      description: "Implement DecodeLabs Project 2 backend",
      status: "pending",
      priority: "high",
      createdAt: "2026-09-16T09:00:00.000Z",
      updatedAt: "2026-09-16T09:00:00.000Z"
    }
  ],
  metadata: {
    nextTaskId: 2
  }
};

/**
 * Configure database file path (useful for test isolation)
 * @param {string} newPath 
 */
export function setDbPath(newPath) {
  currentDbPath = newPath;
}

export function getDbPath() {
  return currentDbPath;
}

/**
 * Ensure database file exists and directory is initialized
 */
export function initDb(initialOverride = null) {
  try {
    const dir = path.dirname(currentDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(currentDbPath) || initialOverride) {
      const dataToSave = initialOverride || defaultData;
      fs.writeFileSync(currentDbPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error(`[DB Init Error] Failed to initialize DB at ${currentDbPath}:`, error.message);
    throw error;
  }
}

/**
 * Read the current database contents
 * @returns {object} { tasks: Array, metadata: object }
 */
export function readDb() {
  try {
    initDb();
    const raw = fs.readFileSync(currentDbPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tasks) || typeof parsed.metadata !== 'object') {
      console.warn(`[DB Warning] Malformed DB structure detected at ${currentDbPath}. Resetting to valid state.`);
      return { ...defaultData };
    }
    return parsed;
  } catch (error) {
    console.error(`[DB Read Error] Error reading from ${currentDbPath}:`, error.message);
    return { ...defaultData };
  }
}

/**
 * Write updated database contents atomically
 * @param {object} data 
 */
export function writeDb(data) {
  try {
    const dir = path.dirname(currentDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${currentDbPath}.tmp-${Date.now()}`;
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, currentDbPath);
  } catch (error) {
    console.error(`[DB Write Error] Error writing to ${currentDbPath}:`, error.message);
    throw new Error('Database write failure');
  }
}
