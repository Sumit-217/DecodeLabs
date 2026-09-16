/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * Automated End-to-End Integration Test Suite
 * Tests REST API routes, SQLite persistence, constraints, and error diagnostics.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import app from '../src/app.js';
import { initDb, closeDb } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_PATH = path.resolve(__dirname, '../database/test_project4.db');

let server;
let baseUrl;

test.before(async () => {
  // Clean up existing test database if present
  if (fs.existsSync(TEST_DB_PATH)) {
    try { fs.unlinkSync(TEST_DB_PATH); } catch (_) {}
  }

  // Initialize DB with test path
  initDb(TEST_DB_PATH);

  // Start server on an ephemeral random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  closeDb();

  // Clean up test db files
  if (fs.existsSync(TEST_DB_PATH)) {
    try { fs.unlinkSync(TEST_DB_PATH); } catch (_) {}
  }
  const walPath = `${TEST_DB_PATH}-wal`;
  const shmPath = `${TEST_DB_PATH}-shm`;
  if (fs.existsSync(walPath)) try { fs.unlinkSync(walPath); } catch (_) {}
  if (fs.existsSync(shmPath)) try { fs.unlinkSync(shmPath); } catch (_) {}
});

test('1. GET /api/health should return system status and SQLite metadata', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.status, 'healthy');
  assert.ok(typeof body.uptime === 'number');
});

test('2. GET /api/interns should return seeded candidates list', async () => {
  const res = await fetch(`${baseUrl}/api/interns`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 6);
  assert.ok(body.data.some(i => i.name === 'Sumit Kumar'));
});

test('3. GET /api/interns with search query should filter records', async () => {
  const res = await fetch(`${baseUrl}/api/interns?search=Sumit`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.length >= 1);
  assert.equal(body.data[0].name, 'Sumit Kumar');
});

test('4. GET /api/interns with track filter should return matching track only', async () => {
  const res = await fetch(`${baseUrl}/api/interns?track=Cloud%20%26%20AI`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.length >= 1);
  assert.ok(body.data.every(i => i.track === 'Cloud & AI'));
});

test('5. GET /api/interns/:id should return single intern or 404', async () => {
  // Existing intern
  const res = await fetch(`${baseUrl}/api/interns/1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.id, 1);

  // Non-existent intern
  const notFoundRes = await fetch(`${baseUrl}/api/interns/99999`);
  assert.equal(notFoundRes.status, 404);
  const notFoundBody = await notFoundRes.json();
  assert.equal(notFoundBody.success, false);
  assert.equal(notFoundBody.error.code, 'NOT_FOUND');
});

test('6. POST /api/interns should create a new record and reject duplicates', async () => {
  const newIntern = {
    name: 'Pooja Verma',
    role: 'Cloud Infrastructure Associate',
    email: 'pooja.verma@decodelabs.dev',
    track: 'Cloud & AI',
    status: 'Active'
  };

  // Valid creation
  const res = await fetch(`${baseUrl}/api/interns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newIntern)
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.name, 'Pooja Verma');
  assert.equal(body.data.email, 'pooja.verma@decodelabs.dev');
  assert.ok(body.data.id > 0);

  // Duplicate email conflict (409)
  const dupRes = await fetch(`${baseUrl}/api/interns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newIntern)
  });

  assert.equal(dupRes.status, 409);
  const dupBody = await dupRes.json();
  assert.equal(dupBody.success, false);
  assert.equal(dupBody.error.code, 'DUPLICATE_EMAIL');
});

test('7. POST /api/interns should enforce validation on invalid payload', async () => {
  const invalidIntern = {
    name: 'A', // too short
    role: '',
    email: 'not-an-email',
    track: 'Invalid Track',
    status: 'Unknown Status'
  };

  const res = await fetch(`${baseUrl}/api/interns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidIntern)
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('8. PUT /api/interns/:id should update existing record', async () => {
  const updatePayload = {
    name: 'Sumit Kumar (Lead)',
    role: 'Senior Full Stack Intern',
    email: 'sumit.kumar@decodelabs.dev',
    track: 'Full Stack Development',
    status: 'Active'
  };

  const res = await fetch(`${baseUrl}/api/interns/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.name, 'Sumit Kumar (Lead)');
  assert.equal(body.data.role, 'Senior Full Stack Intern');
});

test('9. DELETE /api/interns/:id should delete record or return 404', async () => {
  // Delete existing
  const res = await fetch(`${baseUrl}/api/interns/2`, {
    method: 'DELETE'
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);

  // Confirm record is deleted
  const checkRes = await fetch(`${baseUrl}/api/interns/2`);
  assert.equal(checkRes.status, 404);

  // Delete already deleted record
  const secondDelete = await fetch(`${baseUrl}/api/interns/2`, {
    method: 'DELETE'
  });
  assert.equal(secondDelete.status, 404);
});

test('10. GET /api/simulate-error routes should return controlled error responses', async () => {
  const res400 = await fetch(`${baseUrl}/api/simulate-error/400`);
  assert.equal(res400.status, 400);

  const res404 = await fetch(`${baseUrl}/api/simulate-error/404`);
  assert.equal(res404.status, 404);

  const res500 = await fetch(`${baseUrl}/api/simulate-error/500`);
  assert.equal(res500.status, 500);
});

test('11. GET / should serve the frontend SPA index.html', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('DecodeLabs — Intern Management Dashboard'));
});
