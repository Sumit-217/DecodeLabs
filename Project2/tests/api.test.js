import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure test database path BEFORE importing db / app
const testDbPath = path.resolve(__dirname, '../data/test-db.json');
process.env.DB_FILE_PATH = testDbPath;
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100'; // High threshold for full test run

import { createApp } from '../src/app.js';
import { setDbPath, initDb } from '../src/data/db.js';
import { taskRepository } from '../src/repositories/taskRepository.js';
import { resetRateLimiter } from '../src/middleware/rateLimiter.js';

let server;
let baseUrl;

const USER_KEY = process.env.API_USER_KEY || 'demo-user-key';
const ADMIN_KEY = process.env.API_ADMIN_KEY || 'demo-admin-key';

describe('DecodeLabs Project 2: Backend API Automated Test Suite', () => {
  before(async () => {
    // 1. Isolate test database
    setDbPath(testDbPath);
    taskRepository.reset({
      tasks: [
        {
          id: 1,
          title: "Initial Test Task",
          description: "Database seed for testing",
          status: "pending",
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      metadata: {
        nextTaskId: 2
      }
    });

    // 2. Start test server on random free port
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up test server and remove test DB file
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // Ignore unlink error
      }
    }
  });

  // --- 1. Health Endpoint ---
  it('GET /api/v1/health → 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
    assert.ok(typeof body.data.uptime === 'number');
  });

  // --- 2. GET all tasks ---
  it('GET /api/v1/tasks → 200 OK with task list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    assert.equal(body.data[0].id, 1);
  });

  // --- 3. GET task by ID ---
  it('GET /api/v1/tasks/:id → 200 OK for existing task', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, 1);
    assert.equal(body.data.title, 'Initial Test Task');
  });

  it('GET /api/v1/tasks/:id → 404 Not Found for nonexistent task', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/999999`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('GET /api/v1/tasks/:id → 400 Bad Request for non-integer ID (abc)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/abc`);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('GET /api/v1/tasks/:id → 400 Bad Request for zero ID (0)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/0`);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('GET /api/v1/tasks/:id → 400 Bad Request for negative ID (-5)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/-5`);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  // --- 4. POST create task ---
  it('POST /api/v1/tasks → 201 Created with valid payload and user auth', async () => {
    const payload = {
      title: "Write End-to-End Tests",
      description: "Verify all endpoints and status codes",
      status: "in-progress",
      priority: "high"
    };

    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, 2);
    assert.equal(body.data.title, payload.title);
    assert.equal(body.data.status, 'in-progress');
    assert.equal(body.data.priority, 'high');
    assert.ok(body.data.createdAt);
  });

  it('POST /api/v1/tasks → 201 Created with default status and priority values', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Default Value Verification Task"
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'pending');
    assert.equal(body.data.priority, 'medium');
  });

  it('POST /api/v1/tasks → 201 Created using x-api-key header', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': USER_KEY
      },
      body: JSON.stringify({
        title: "API Key Header Test"
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  // --- 5. Input Validation Failures (400 Bad Request) ---
  it('POST /api/v1/tasks → 400 Bad Request when title is missing', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        description: "Task without title"
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.title);
  });

  it('POST /api/v1/tasks → 400 Bad Request when title is too short (<3 chars)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "ab"
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.title);
  });

  it('POST /api/v1/tasks → 400 Bad Request when title is too long (>100 chars)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "A".repeat(101)
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.title);
  });

  it('POST /api/v1/tasks → 400 Bad Request when description is too long (>500 chars)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Valid Title",
        description: "D".repeat(501)
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.description);
  });

  it('POST /api/v1/tasks → 400 Bad Request when status enum is invalid', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Valid Title Here",
        status: "almost-done" // invalid enum
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.status);
  });

  it('POST /api/v1/tasks → 400 Bad Request when priority enum is invalid', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Valid Title Here",
        priority: "critical" // invalid enum
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.priority);
  });

  it('POST /api/v1/tasks → 400 Bad Request when title is wrong data type (number)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: 12345
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  // --- 6. PUT update task ---
  it('PUT /api/v1/tasks/:id → 200 OK for valid update', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Updated Task Title",
        status: "completed"
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.title, "Updated Task Title");
    assert.equal(body.data.status, "completed");
  });

  it('PUT /api/v1/tasks/:id → 400 Bad Request when updating with invalid status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        status: "invalid-status"
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fields.status);
  });

  it('PUT /api/v1/tasks/:id → 400 Bad Request when no updatable fields provided', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        extraField: "ignored"
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('PUT /api/v1/tasks/:id → 404 Not Found for nonexistent ID', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/999999`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_KEY}`
      },
      body: JSON.stringify({
        title: "Should Not Update"
      })
    });

    assert.equal(res.status, 404);
  });

  // --- 7. Authentication Guards (401 Unauthorized) ---
  it('POST /api/v1/tasks → 401 Unauthorized without token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "No Auth Token"
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/v1/tasks → 401 Unauthorized with invalid token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wrong-secret-token'
      },
      body: JSON.stringify({
        title: "Invalid Auth Token"
      })
    });

    assert.equal(res.status, 401);
  });

  // --- 8. Authorization Guards (403 Forbidden) ---
  it('DELETE /api/v1/tasks/:id → 403 Forbidden for non-admin user key', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${USER_KEY}` // User role, not admin
      }
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  // --- 9. DELETE task (204 No Content) ---
  it('DELETE /api/v1/tasks/:id → 204 No Content for admin key', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ADMIN_KEY}` // Admin role
      }
    });

    assert.equal(res.status, 204);
    const text = await res.text();
    assert.equal(text, ''); // Spec: No body for 204

    // Verify task is now deleted
    const checkRes = await fetch(`${baseUrl}/api/v1/tasks/1`);
    assert.equal(checkRes.status, 404);
  });

  it('DELETE /api/v1/tasks/:id → 404 Not Found for already deleted task', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/1`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ADMIN_KEY}`
      }
    });

    assert.equal(res.status, 404);
  });

  // --- 10. 404 Catch-all on Unknown Endpoint ---
  it('GET /api/v1/does-not-exist → 404 Not Found with consistent JSON envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/does-not-exist`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  // --- 11. Centralized Error Simulation (500 Internal Server Error) ---
  it('POST /api/v1/simulate-error → 500 Internal Server Error handled centrally', async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulate-error`, {
      method: 'POST'
    });

    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.ok(body.error.message);
  });

  // --- 12. Rate Limiter (429 Too Many Requests) ---
  it('Rapid requests trigger 429 Too Many Requests threshold', async () => {
    resetRateLimiter();
    // In this test environment, threshold is 100
    let hitRateLimit = false;

    for (let i = 0; i < 105; i++) {
      const res = await fetch(`${baseUrl}/api/v1/tasks`);
      if (res.status === 429) {
        hitRateLimit = true;
        const body = await res.json();
        assert.equal(body.success, false);
        assert.equal(body.error.code, 'RATE_LIMIT_EXCEEDED');
        assert.ok(res.headers.get('Retry-After'));
        assert.ok(res.headers.get('X-RateLimit-Limit'));
        break;
      }
    }

    assert.equal(hitRateLimit, true, 'Rate limit 429 should have been triggered');
  });
});
