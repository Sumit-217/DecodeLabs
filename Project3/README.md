# DecodeLabs Project 3 — Database Integration

> **DecodeLabs Industrial Training Kit (Batch 2026)**  
> **Track:** Full Stack Development — Project 3: Database Integration  
> **Goal:** Connect the backend with a database to store and retrieve data.

An independent, production-grade RESTful API built with **Node.js (ES Modules)** and **Express.js**, integrated with a persistent **SQLite** database. Demonstrates complete CRUD operations, schema design, parameterized query safety, strict server-side validation, error handling, and verified data persistence across server restarts.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Database Used](#2-database-used)
3. [Database Schema](#3-database-schema)
4. [Database Connection](#4-database-connection)
5. [CRUD Endpoints & API Reference](#5-crud-endpoints--api-reference)
6. [Data Validation & Handling](#6-data-validation--handling)
7. [How Persistence Works](#7-how-persistence-works)
8. [Installation & Quickstart](#8-installation--quickstart)
9. [Automated Testing](#9-automated-testing)
10. [Project Independence](#10-project-independence)

---

## 1. Project Overview

Project 3 focuses on **Database Integration and State Persistence** ("The Digital Vault"):
- **Goal:** Connect the backend with a database to store and retrieve data.
- **Architecture:** Decoupled Express.js server interfacing directly with a persistent SQLite database.

### Official Core Competencies:
- **Databases:** Relational table structures, primary keys, and data types.
- **CRUD Operations:** Create (`POST`), Read (`GET`), Update (`PUT`), Delete (`DELETE`).
- **Data Storage:** Permanent, reliable file-backed persistence.
- **Data Handling:** Comprehensive input validation, constraint enforcement, and error isolation.

---

## 2. Database Used

Project 3 utilizes **SQLite** as its dedicated local relational database:
- **Engine:** Built-in high-performance SQLite engine (`DatabaseSync` in Node.js 22+) with WAL (Write-Ahead Logging) mode and foreign key enforcement (`PRAGMA foreign_keys = ON;`).
- **Storage Location:** `./database/project3.db` (Configurable via `DB_PATH` in `.env`).
- **Characteristics:**
  - **Serverless & Self-Contained:** Stored directly on disk as a binary file; no separate database server daemon required.
  - **ACID Compliant:** Ensures atomic transactions and reliable state persistence.
  - **Parameterized Query Support:** 100% immune to SQL injection through native prepared statements (`db.prepare(...)`).

---

## 3. Database Schema

Project 3 defines a clean, simple database schema for an `items` resource in [`src/database/schema.sql`](src/database/schema.sql):

```sql
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  in_stock INTEGER NOT NULL DEFAULT 1 CHECK (in_stock IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Field Definitions:

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each record |
| `name` | `TEXT` | `NOT NULL` | Item title or product name |
| `description` | `TEXT` | `NULL` | Optional detailed description |
| `category` | `TEXT` | `NOT NULL` | Grouping classification |
| `price` | `REAL` | `NOT NULL, CHECK (price >= 0)` | Numeric unit price (non-negative) |
| `in_stock` | `INTEGER` | `NOT NULL DEFAULT 1, CHECK (in_stock IN (0, 1))` | Stock availability (1 = true, 0 = false) |
| `created_at` | `TEXT` | `NOT NULL DEFAULT (datetime('now'))` | ISO timestamp of record insertion |
| `updated_at` | `TEXT` | `NOT NULL DEFAULT (datetime('now'))` | ISO timestamp of last modification |

---

## 4. Database Connection

The database connection layer is implemented in [`src/database/db.js`](src/database/db.js):

1. **Boot Lifecycle:**
   - Reads `DB_PATH` from the environment (`.env`), defaulting to `./database/project3.db`.
   - Automatically creates the parent directory (`database/`) if it does not already exist.
   - Opens the persistent SQLite database file.
   - Activates `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;`.
   - Executes the DDL statements in `src/database/schema.sql` via `CREATE TABLE IF NOT EXISTS`.
2. **Execution Layer:**
   - Exposes clean, parameterized query helpers:
     - `run(sql, params)` — For `INSERT`, `UPDATE`, `DELETE` operations.
     - `get(sql, params)` — For single-record `SELECT` queries.
     - `all(sql, params)` — For multi-record collection queries.
     - `closeDb()` — For graceful shutdown and connection release.

---

## 5. CRUD Endpoints & API Reference

Base URL: `http://localhost:3001`

### 1. Health Check
- **`GET /api/health`**
  - **Response (200 OK):**
    ```json
    {
      "status": "healthy",
      "project": "DecodeLabs Project 3 — Database Integration",
      "timestamp": "2026-09-16T10:55:00.000Z"
    }
    ```

---

### 2. CREATE (Insert Item)
- **`POST /api/items`**
  - **Request Body:**
    ```json
    {
      "name": "Mechanical Keyboard",
      "description": "Tactile switch mechanical keyboard",
      "category": "Peripherals",
      "price": 89.99,
      "in_stock": true
    }
    ```
  - **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "name": "Mechanical Keyboard",
        "description": "Tactile switch mechanical keyboard",
        "category": "Peripherals",
        "price": 89.99,
        "in_stock": 1,
        "created_at": "2026-09-16 10:55:00",
        "updated_at": "2026-09-16 10:55:00"
      }
    }
    ```

---

### 3. READ ALL (Fetch Items)
- **`GET /api/items`**
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "count": 1,
      "data": [
        {
          "id": 1,
          "name": "Mechanical Keyboard",
          "description": "Tactile switch mechanical keyboard",
          "category": "Peripherals",
          "price": 89.99,
          "in_stock": 1,
          "created_at": "2026-09-16 10:55:00",
          "updated_at": "2026-09-16 10:55:00"
        }
      ]
    }
    ```

---

### 4. READ ONE (Fetch Item by ID)
- **`GET /api/items/:id`**
  - **Example:** `GET /api/items/1`
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "name": "Mechanical Keyboard",
        "description": "Tactile switch mechanical keyboard",
        "category": "Peripherals",
        "price": 89.99,
        "in_stock": 1,
        "created_at": "2026-09-16 10:55:00",
        "updated_at": "2026-09-16 10:55:00"
      }
    }
    ```
  - **Nonexistent Record (404 Not Found):**
    ```json
    {
      "success": false,
      "error": "Item not found with id: 999"
    }
    ```

---

### 5. UPDATE (Modify Item by ID)
- **`PUT /api/items/:id`**
  - **Example:** `PUT /api/items/1`
  - **Request Body:**
    ```json
    {
      "name": "Mechanical Keyboard (RGB Edition)",
      "description": "Custom keycaps and per-key RGB backlighting",
      "category": "Peripherals",
      "price": 109.99,
      "in_stock": true
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "name": "Mechanical Keyboard (RGB Edition)",
        "description": "Custom keycaps and per-key RGB backlighting",
        "category": "Peripherals",
        "price": 109.99,
        "in_stock": 1,
        "created_at": "2026-09-16 10:55:00",
        "updated_at": "2026-09-16 10:58:12"
      }
    }
    ```

---

### 6. DELETE (Remove Item by ID)
- **`DELETE /api/items/:id`**
  - **Example:** `DELETE /api/items/1`
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Item deleted successfully",
      "data": {
        "id": 1,
        "name": "Mechanical Keyboard (RGB Edition)",
        "category": "Peripherals",
        "price": 109.99
      }
    }
    ```

---

## 6. Data Validation & Handling

Project 3 follows the principle of **"Never Trust the Client"** with defensive validation at two distinct architectural levels:

1. **Application Routing & Controller Level:**
   - Validates that `name` and `category` are non-empty strings.
   - Validates that `price` is present, numeric, and non-negative (`>= 0`).
   - Validates that `in_stock` (when provided) is boolean or `0`/`1`.
   - Validates that route `:id` parameters are positive integers.
   - Rejects invalid requests immediately with `400 Bad Request`.
2. **Schema & Database Level:**
   - `NOT NULL` constraints on core fields.
   - `CHECK (price >= 0)` constraint enforced by the SQLite database engine.
   - `CHECK (in_stock IN (0, 1))` constraint.
3. **Database Error Handling:**
   - Constraint violations are intercepted by [`src/middleware/errorHandler.js`](src/middleware/errorHandler.js) and returned as friendly JSON errors without exposing stack traces or terminating the server process.

---

## 7. How Persistence Works

Unlike in-memory data structures (arrays or objects) that reset whenever a server process exits, Project 3 achieves permanent state persistence through a local disk file:

1. When a client performs `POST /api/items`, the backend issues a parameterized `INSERT` command to the SQLite engine.
2. The SQLite engine writes the record to `./database/project3.db` on the file system and flushes WAL logs.
3. When the Node.js application process is stopped, all database data remains intact on disk.
4. When the application starts again, `initDb()` opens the existing `./database/project3.db` file.
5. All previously stored records are immediately available and retrievable via `GET /api/items`.

---

## 8. Installation & Quickstart

### Prerequisites:
- **Node.js** v20.0.0 or higher (Tested on Node.js v22.17.0).
- **npm** v10.0.0 or higher.

### Step 1: Navigate to Project 3
```powershell
cd "c:\Users\SUMIT\AntiGraviti_Workspace\DecodeLabs\Project3"
```

### Step 2: Install Independent Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
```powershell
Copy-Item .env.example .env
```

### Step 4: Start the Server
```powershell
npm start
```
The server will start listening at `http://localhost:3001`.

---

## 9. Automated Testing

Project 3 includes an independent, zero-dependency automated test suite using Node.js's native test runner (`node:test` and `node:assert`).

Run all tests from the Project 3 folder:
```powershell
npm test
```

### Test Coverage:
- **`tests/database.test.js`**:
  - `GET /api/health` — Confirms health and project metadata.
  - `POST /api/items` — Validates record creation and verifies direct database storage.
  - Input Validation — Rejects missing names, empty categories, negative prices (`400 Bad Request`).
  - `GET /api/items` — Tests full collection retrieval.
  - `GET /api/items/:id` — Tests individual retrieval, 404 for missing IDs, 400 for invalid ID formats.
  - `PUT /api/items/:id` — Tests updates, 404 for missing records, 400 for invalid bodies.
  - `DELETE /api/items/:id` — Tests record deletion and confirms removal from database.
- **`tests/persistence.test.js`**:
  - Starts Project 3 instance 1.
  - Inserts a record into the database.
  - Stops instance 1 and closes database connections.
  - Verifies database file exists on disk.
  - Starts Project 3 instance 2 (simulating a clean server reboot).
  - Retrieves the identical record created in instance 1.

---

## 10. Project Independence
 
Project 3 is **100% self-contained and decoupled**:
- **Fully Standalone:** Does not rely on any external project or outside code.
- **Dedicated Database:** Uses its own database (`database/project3.db`).
- **Independent Manifest:** Has its own `package.json`, dependencies, scripts, and lockfile.
- **Clean Machine Ready:** Can be cloned or copied to any machine with Node.js and run independently via `npm install && npm test`.
