import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let currentDbPath = null;

/**
 * Initialize database connection and ensure tables are created.
 * @param {string} [customPath] Optional custom database file path (useful for testing)
 */
export function initDb(customPath = null) {
  const targetPath = customPath || process.env.DB_PATH || path.resolve(__dirname, '../../database/project3.db');
  
  // Close any existing connection if path changed
  if (dbInstance && currentDbPath !== targetPath) {
    closeDb();
  }

  if (!dbInstance) {
    // Ensure parent directory exists
    const dir = path.dirname(path.resolve(targetPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    currentDbPath = targetPath;
    dbInstance = new DatabaseSync(targetPath);

    // Apply foreign key support and WAL mode for concurrent access
    try {
      dbInstance.exec('PRAGMA foreign_keys = ON;');
      dbInstance.exec('PRAGMA journal_mode = WAL;');
    } catch (_) {}

    // Load and execute schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    dbInstance.exec(schemaSql);
  }

  return dbInstance;
}

/**
 * Get active database instance (initializes default if not yet initialized)
 */
export function getDb() {
  if (!dbInstance) {
    return initDb();
  }
  return dbInstance;
}

/**
 * Close database connection safely
 */
export function closeDb() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (_) {}
    dbInstance = null;
    currentDbPath = null;
  }
}

/**
 * Execute a parameterized query (INSERT, UPDATE, DELETE)
 * @param {string} sql 
 * @param {Array} params 
 * @returns {{ lastInsertRowid: number|bigint, changes: number }}
 */
export function run(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/**
 * Fetch a single record matching the query
 * @param {string} sql 
 * @param {Array} params 
 * @returns {object|undefined}
 */
export function get(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

/**
 * Fetch all records matching the query
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Array<object>}
 */
export function all(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}
