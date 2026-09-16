import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { closeDb, getDb } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.resolve(__dirname, 'test_database.db');

describe('DecodeLabs Project 3 — Database Integration Test Suite', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    // Clean up any stale test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    app = createApp(testDbPath);
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    closeDb();
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (_) {}
    }
  });

  describe('1. Health and Verification', () => {
    it('GET /api/health returns healthy status', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'healthy');
      assert.ok(data.project.includes('Project 3'));
    });
  });

  describe('2. CREATE Operations (POST /api/items)', () => {
    it('successfully creates an item with valid data and stores it in DB', async () => {
      const payload = {
        name: 'Database Architecture Handbook',
        description: 'Guide to state persistence and relational models',
        category: 'Education',
        price: 49.99,
        in_stock: true
      };

      const res = await fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.id >= 1);
      assert.equal(body.data.name, payload.name);
      assert.equal(body.data.category, payload.category);
      assert.equal(body.data.price, payload.price);
      assert.equal(body.data.in_stock, 1);

      // Verify directly from SQLite DB
      const db = getDb();
      const row = db.prepare('SELECT * FROM items WHERE id = ?').get(body.data.id);
      assert.ok(row, 'Record must physically exist in SQLite database');
      assert.equal(row.name, payload.name);
    });

    it('rejects creation when required "name" is missing', async () => {
      const payload = {
        category: 'Electronics',
        price: 100
      };

      const res = await fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes("'name' is required"));
    });

    it('rejects creation when required "category" is empty', async () => {
      const payload = {
        name: 'Keyboard',
        category: '   ',
        price: 25.50
      };

      const res = await fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes("'category' is required"));
    });

    it('rejects creation when "price" is negative or not a number', async () => {
      const payload = {
        name: 'Mouse',
        category: 'Electronics',
        price: -10
      };

      const res = await fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes("'price' is required and must be a non-negative number"));
    });
  });

  describe('3. READ ALL Operations (GET /api/items)', () => {
    it('retrieves all stored records from the database', async () => {
      // Add a second item
      await fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mechanical Switch',
          category: 'Hardware',
          price: 15.00
        })
      });

      const res = await fetch(`${baseUrl}/api/items`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.count >= 2);
      assert.ok(body.data.some((item) => item.name === 'Mechanical Switch'));
    });
  });

  describe('4. READ ONE Operations (GET /api/items/:id)', () => {
    it('retrieves an existing record by ID', async () => {
      const res = await fetch(`${baseUrl}/api/items/1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, 1);
      assert.equal(body.data.name, 'Database Architecture Handbook');
    });

    it('returns 404 when item does not exist', async () => {
      const res = await fetch(`${baseUrl}/api/items/99999`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes('not found'));
    });

    it('returns 400 when invalid ID parameter is passed', async () => {
      const res = await fetch(`${baseUrl}/api/items/invalid-id`);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes('Invalid ID'));
    });
  });

  describe('5. UPDATE Operations (PUT /api/items/:id)', () => {
    it('successfully updates an existing database record', async () => {
      const updatePayload = {
        name: 'Database Architecture Handbook - 2nd Edition',
        description: 'Revised and expanded for 2026',
        category: 'Education',
        price: 59.99,
        in_stock: false
      };

      const res = await fetch(`${baseUrl}/api/items/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, 1);
      assert.equal(body.data.name, updatePayload.name);
      assert.equal(body.data.price, 59.99);
      assert.equal(body.data.in_stock, 0);

      // Verify update in SQLite database
      const db = getDb();
      const row = db.prepare('SELECT * FROM items WHERE id = 1').get();
      assert.equal(row.name, updatePayload.name);
      assert.equal(row.price, 59.99);
    });

    it('returns 404 when attempting to update a nonexistent record', async () => {
      const res = await fetch(`${baseUrl}/api/items/99999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Phantom Item',
          category: 'Misc',
          price: 10
        })
      });

      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes('not found'));
    });

    it('returns 400 when update payload contains invalid data', async () => {
      const res = await fetch(`${baseUrl}/api/items/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          category: 'Education',
          price: -5
        })
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });
  });

  describe('6. DELETE Operations (DELETE /api/items/:id)', () => {
    it('successfully deletes an existing database record', async () => {
      const res = await fetch(`${baseUrl}/api/items/1`, {
        method: 'DELETE'
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.message.includes('deleted successfully'));

      // Verify it is no longer in the database
      const db = getDb();
      const row = db.prepare('SELECT * FROM items WHERE id = 1').get();
      assert.equal(row, undefined);

      // Verify GET returns 404 now
      const getRes = await fetch(`${baseUrl}/api/items/1`);
      assert.equal(getRes.status, 404);
    });

    it('returns 404 when attempting to delete a nonexistent record', async () => {
      const res = await fetch(`${baseUrl}/api/items/99999`, {
        method: 'DELETE'
      });

      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.error.includes('not found'));
    });
  });
});
