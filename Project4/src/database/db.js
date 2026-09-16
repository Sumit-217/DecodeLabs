/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * Database Provider Layer using Node.js Native SQLite (DatabaseSync)
 * Features: Write-Ahead Logging (WAL), Parameterized Statements & Clean Seed Migration.
 */

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

const INITIAL_SEEDS = [
  {
    name: 'Sumit Kumar',
    role: 'Full Stack Engineer Intern',
    email: 'sumit.kumar@decodelabs.dev',
    track: 'Full Stack Development',
    status: 'Active'
  },
  {
    name: 'Aarav Patel',
    role: 'Frontend UI/UX Specialist',
    email: 'aarav.patel@decodelabs.dev',
    track: 'Frontend Engineering',
    status: 'Active'
  },
  {
    name: 'Diya Sharma',
    role: 'Backend Systems Engineer',
    email: 'diya.sharma@decodelabs.dev',
    track: 'Backend Engineering',
    status: 'Graduated'
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Cloud & AI Associate',
    email: 'rohan.deshmukh@decodelabs.dev',
    track: 'Cloud & AI',
    status: 'Active'
  },
  {
    name: 'Ananya Roy',
    role: 'Full Stack Core Intern',
    email: 'ananya.roy@decodelabs.dev',
    track: 'Full Stack Development',
    status: 'On Leave'
  },
  {
    name: 'Vikram Mehta',
    role: 'API Integration Developer',
    email: 'vikram.mehta@decodelabs.dev',
    track: 'Backend Engineering',
    status: 'Graduated'
  }
];

/**
 * Initialize database connection and ensure tables are created.
 * @param {string} [customPath] Optional custom database file path
 */
export function initDb(customPath = null) {
  const targetPath = customPath || process.env.DATABASE_PATH || path.resolve(__dirname, '../../database/project4.db');

  if (dbInstance && currentDbPath !== targetPath) {
    closeDb();
  }

  if (!dbInstance) {
    const dir = path.dirname(path.resolve(targetPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    currentDbPath = targetPath;
    dbInstance = new DatabaseSync(targetPath);

    // Apply foreign keys and WAL mode
    try {
      dbInstance.exec('PRAGMA foreign_keys = ON;');
      dbInstance.exec('PRAGMA journal_mode = WAL;');
    } catch (_) {}

    // Load and execute schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    dbInstance.exec(schemaSql);

    // Seed initial records if table is currently empty
    try {
      const countResult = dbInstance.prepare('SELECT COUNT(*) as count FROM interns').get();
      if (countResult && countResult.count === 0) {
        const insertStmt = dbInstance.prepare(
          'INSERT INTO interns (name, role, email, track, status) VALUES (?, ?, ?, ?, ?)'
        );
        for (const intern of INITIAL_SEEDS) {
          insertStmt.run(intern.name, intern.role, intern.email, intern.track, intern.status);
        }
      }
    } catch (_) {}
  }

  return dbInstance;
}

/**
 * Get active database instance
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
