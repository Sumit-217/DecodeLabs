import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { closeDb } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const persistenceDbPath = path.resolve(__dirname, 'persistence_verification.db');

describe('DecodeLabs Project 3 — Persistent Storage Verification', () => {
  it('verifies that data persists across complete application and database restarts', async () => {
    // Clean up from previous runs if any
    if (fs.existsSync(persistenceDbPath)) {
      fs.unlinkSync(persistenceDbPath);
    }

    // --- PHASE 1: Start Project 3 Instance 1 ---
    let app1 = createApp(persistenceDbPath);
    let server1;
    let port1;

    await new Promise((resolve) => {
      server1 = app1.listen(0, () => {
        port1 = server1.address().port;
        resolve();
      });
    });

    // 2. Create a persistent record via API
    const createRes = await fetch(`http://127.0.0.1:${port1}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Persistent Vault Entry',
        description: 'Record that survives server termination',
        category: 'Persistence',
        price: 99.95,
        in_stock: true
      })
    });

    assert.equal(createRes.status, 201, 'Record should be successfully created');
    const createdItem = (await createRes.json()).data;
    assert.ok(createdItem.id, 'Created record must have an ID');

    // 3. Retrieve the record
    const getRes1 = await fetch(`http://127.0.0.1:${port1}/api/items/${createdItem.id}`);
    assert.equal(getRes1.status, 200);
    const item1 = (await getRes1.json()).data;
    assert.equal(item1.name, 'Persistent Vault Entry');

    // 4. STOP Project 3 Instance 1 (Shutdown server and close database)
    await new Promise((resolve) => server1.close(resolve));
    closeDb();

    // Verify database file exists on disk
    assert.ok(fs.existsSync(persistenceDbPath), 'Database file must physically exist on disk');
    const fileSize = fs.statSync(persistenceDbPath).size;
    assert.ok(fileSize > 0, 'Database file must contain written bytes');

    // --- PHASE 2: Start Project 3 Instance 2 (Simulating clean reboot) ---
    let app2 = createApp(persistenceDbPath);
    let server2;
    let port2;

    await new Promise((resolve) => {
      server2 = app2.listen(0, () => {
        port2 = server2.address().port;
        resolve();
      });
    });

    // 6. Retrieve the same record from the rebooted server
    const getRes2 = await fetch(`http://127.0.0.1:${port2}/api/items/${createdItem.id}`);
    assert.equal(getRes2.status, 200, 'Record must be retrievable after application restart');
    const item2 = (await getRes2.json()).data;
    assert.equal(item2.id, createdItem.id);
    assert.equal(item2.name, 'Persistent Vault Entry');
    assert.equal(item2.price, 99.95);

    // Clean up
    await new Promise((resolve) => server2.close(resolve));
    closeDb();
    if (fs.existsSync(persistenceDbPath)) {
      try {
        fs.unlinkSync(persistenceDbPath);
      } catch (_) {}
    }
  });
});
