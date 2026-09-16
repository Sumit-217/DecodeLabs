# DecodeLabs Project 2 — Backend API Development

> **Batch 2026 | Powered by DecodeLabs — Industrial Training Kit**  
> **Theme:** *"The Nervous System" — Engineering the Backend API & Architectural Integrity*

A robust, production-grade RESTful API built with **Node.js (ES Modules)** and **Express.js**. Demonstrates the **IPO (Input-Process-Output)** model, strict server-side validation ("Never Trust the Client"), standard semantic HTTP status codes, autonomic defenses (API Key Authentication, Role-Based Authorization, Rate Limiting, Centralized Error Handling), local JSON persistence with atomic writes, automated test suites, OpenAPI 3.0 documentation, and a built-in interactive **Developer Studio / API Playground**.

---

## Table of Contents
- [1. Overview & Objectives](#1-overview--objectives)
- [2. DecodeLabs Requirement Traceability](#2-decodelabs-requirement-traceability)
- [3. System Architecture](#3-system-architecture)
- [4. Technology Stack](#4-technology-stack)
- [5. Project Structure](#5-project-structure)
- [6. Installation & Quickstart](#6-installation--quickstart)
- [7. Environment Configuration](#7-environment-configuration)
- [8. API Reference](#8-api-reference)
- [9. Data Validation Rules](#9-data-validation-rules)
- [10. Autonomic Defense & Security](#10-autonomic-defense--security)
- [11. Developer Studio (Interactive API Console)](#11-developer-studio-interactive-api-console)
- [12. OpenAPI 3.0 Documentation](#12-openapi-30-documentation)
- [13. Automated Testing](#13-automated-testing)
- [14. Production Readiness & Deployment](#14-production-readiness--deployment)

---

## 1. Overview & Objectives

Project 2 serves as the vital integration phase connecting frontend user interaction to server-side business computation. In the DecodeLabs architectural blueprint:
- **Project 1** represented *The Skin* (Client / User Interface).
- **Project 2** represents *The Nervous System* (Backend API, Data Flow, Autonomic Guards, and Persistence).

### Core Objectives:
1. **API Development**: Expose clean, predictable RESTful endpoints following standard conventions (nouns for resources, HTTP verbs for actions).
2. **GET & POST Handling**: Deliver comprehensive data retrieval (`GET`) and data creation/ingestion (`POST`), extended to full CRUD (`PUT`, `DELETE`).
3. **Strict Input Handling & Validation**: Apply the Gatekeeper Rule (*"Never Trust the Client"*) through syntactic and semantic validation.
4. **Server-Side Processing (IPO Model)**: Cleanly decouple HTTP controllers, business logic services, and repository persistence.
5. **Autonomic Defense**: Protect resources with API token authentication (`401`), role-based authorization (`403`), and rate limiting (`429`).

---

## 2. DecodeLabs Requirement Traceability

Every mandatory and advanced requirement from the DecodeLabs Industrial Training syllabus is verified and mapped below:

| DecodeLabs Requirement | Implementation Component | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Backend API** | Express.js application (`src/app.js`, `src/server.js`) | Starts cleanly on `http://localhost:3000` | **Verified** |
| **GET Endpoints** | `/api/v1/health`, `/api/v1/tasks`, `/api/v1/tasks/:id` | Unit & integration tests in `tests/api.test.js` | **Verified** |
| **POST Endpoints** | `/api/v1/tasks`, `/api/v1/simulate-error` | Tested with valid, invalid, and error payloads | **Verified** |
| **Handle User Input** | Express JSON body parser & route parameter parsers | Validated with objects, primitives, and edge cases | **Verified** |
| **Handle Responses** | Unified envelope: `{ success: true, data }` / `{ success: false, error }` | Tested across all status codes | **Verified** |
| **Basic Data Validation** | `src/middleware/validator.js` (length, type, enum, empty checks) | 5 distinct 400 Bad Request automated tests | **Verified** |
| **Architectural Separation** | Layered Controller → Service → Repository → Persistence | Clean separation of concerns | **Verified** |
| **Security & Autonomic Defense** | Helmet, CORS, Token AuthN (401), Role AuthZ (403), Limiter (429) | Integration tests verify 401, 403, and 429 | **Verified** |
| **Developer Experience (DX)** | Built-in Developer Studio served at `GET /` | Interactive in-browser testing UI | **Verified** |
| **API Documentation** | OpenAPI 3.0 specification (`docs/openapi.yaml`) | Accessible at `/openapi.yaml` and `/api/docs` | **Verified** |

---

## 3. System Architecture

The application adopts a clean, layered architectural pattern:

```text
Client (Developer Studio / Browser / cURL)
   │
   ▼ HTTP Request
[Middleware Pipeline]
   ├── 1. Request Logger (High-resolution process.hrtime latency tracking)
   ├── 2. Security Headers (Helmet)
   ├── 3. CORS Guard
   ├── 4. In-Memory Rate Limiter (429 Too Many Requests)
   ├── 5. Authenticator AuthN (401 Unauthorized)
   ├── 6. Authorizer AuthZ (403 Forbidden)
   └── 7. Gatekeeper Validator (400 Bad Request)
   │
   ▼ Validated Route Dispatch
[Routes: /api/v1/tasks, /api/v1/health]
   │
   ▼ HTTP Handling
[Controllers: taskController, systemController]
   │
   ▼ Business Logic (IPO Processing)
[Services: taskService]
   │
   ▼ Data Abstraction
[Repositories: taskRepository]
   │
   ▼ Atomic File Persistence
[JSON Data Store: data/db.json]
   │
   ▼ Standardized JSON Envelope
Client Response (200, 201, 204, 400, 401, 403, 404, 429, 500)
```

---

## 4. Technology Stack

- **Runtime**: Node.js (v22+)
- **Module System**: ES Modules (`"type": "module"`)
- **Web Framework**: Express.js (v4.21+)
- **Security**: Helmet (HTTP security headers) & CORS
- **Configuration**: Dotenv (`.env` / `.env.example`)
- **Persistence**: Local JSON-based storage engine with atomic writes
- **Test Runner**: Node.js Native Test Runner (`node --test`) & Native `node:assert/strict`
- **Documentation**: OpenAPI 3.0.3 Specification (`docs/openapi.yaml`)
- **Frontend Studio**: Vanilla HTML5, CSS3 (Nervous System glow theme), Modern ES6 JavaScript

---

## 5. Project Structure

```text
Project2/
├── package.json              # Project configuration, dependencies, and scripts
├── .env.example              # Example environment variables template
├── .env                      # Local runtime environment configuration (git-ignored)
├── .gitignore                # Git exclusions (node_modules, logs, secrets)
├── README.md                 # Complete documentation & evaluation guide
│
├── data/
│   └── db.json               # Auto-initialized persistent local database
│
├── src/
│   ├── server.js             # Application bootstrapper & graceful shutdown handlers
│   ├── app.js                # Express app assembly & middleware pipeline
│   │
│   ├── routes/
│   │   ├── tasks.js          # RESTful routes for /api/v1/tasks
│   │   └── system.js         # Routes for /health and /simulate-error
│   │
│   ├── controllers/
│   │   ├── taskController.js # HTTP request/response handler for tasks
│   │   └── systemController.js # HTTP handler for health and error checks
│   │
│   ├── services/
│   │   └── taskService.js    # Core business logic and data transformation
│   │
│   ├── repositories/
│   │   └── taskRepository.js # Data access layer interacting with db.json
│   │
│   ├── data/
│   │   └── db.js             # Atomic JSON read/write persistence module
│   │
│   ├── middleware/
│   │   ├── logger.js         # Request latency logger using process.hrtime.bigint()
│   │   ├── rateLimiter.js    # In-memory sliding window rate limiter (429)
│   │   ├── auth.js           # API token authentication (401) and RBAC (403)
│   │   ├── validator.js      # Syntactic and semantic validation middleware (400)
│   │   └── errorHandler.js   # Centralized error and 404 handler (500)
│   │
│   └── utils/
│       └── response.js       # Standard JSON response formatting utilities
│
├── public/                   # Developer Studio / API Playground (served at GET /)
│   ├── index.html            # Studio user interface layout
│   ├── style.css             # Futuristic dark mode styling
│   └── app.js                # In-browser test runner and live resource explorer
│
├── tests/
│   └── api.test.js           # Automated end-to-end API test suite (19 test cases)
│
└── docs/
    └── openapi.yaml          # Formal OpenAPI 3.0 specification
```

---

## 6. Installation & Quickstart

### Prerequisites
- Node.js version 22.0.0 or higher
- npm version 10.0.0 or higher

### Steps to Run:
```bash
# 1. Clone or navigate to the workspace
cd Project2

# 2. Install dependencies
npm install

# 3. Start the production server
npm start
```

Once started, open your web browser to:
👉 **`http://localhost:3000`** to access the interactive **Developer Studio**.

### Development Mode (with hot reloading):
```bash
npm run dev
```

---

## 7. Environment Configuration

The application is configurable via `.env`. A complete template is provided in `.env.example`:

```env
# Server Runtime
NODE_ENV=development
PORT=3000

# Authentication API Keys
API_USER_KEY=demo-user-key
API_ADMIN_KEY=demo-admin-key

# Autonomic Defense Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# CORS Security
CORS_ORIGIN=*
```

---

## 8. API Reference

All primary API endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description | Auth Required | Success Status | Error Statuses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | Health check & system uptime | Public | `200 OK` | `500` |
| **GET** | `/api/v1/tasks` | List tasks (supports query filters) | Public | `200 OK` | `429`, `500` |
| **GET** | `/api/v1/tasks/:id` | Retrieve single task by numeric ID | Public | `200 OK` | `400`, `404`, `429` |
| **POST** | `/api/v1/tasks` | Create and persist a new task | User or Admin | `201 Created` | `400`, `401`, `429` |
| **PUT** | `/api/v1/tasks/:id` | Update an existing task | User or Admin | `200 OK` | `400`, `401`, `404` |
| **DELETE** | `/api/v1/tasks/:id` | Permanently delete a task | Admin Only | `204 No Content` | `401`, `403`, `404` |
| **POST** | `/api/v1/simulate-error` | Deliberately trigger 500 error | Public | - | `500 Internal Error` |

### Unified Response Format:

#### Success Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Build REST API",
    "description": "Implement DecodeLabs Project 2 backend",
    "status": "pending",
    "priority": "high",
    "createdAt": "2026-09-16T09:00:00.000Z",
    "updatedAt": "2026-09-16T09:00:00.000Z"
  }
}
```

#### Validation Error (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed. Please review the provided fields.",
    "fields": {
      "title": "Title must be at least 3 characters long.",
      "status": "Status must be one of: pending, in-progress, completed."
    }
  }
}
```

---

## 9. Data Validation Rules

Server-side validation is enforced by `src/middleware/validator.js` following the **Gatekeeper Principle**:

- **`title`**:
  - Required on `POST`.
  - Type: `string`.
  - Length: Minimum **3 characters**, maximum **100 characters** (whitespace trimmed).
- **`description`**:
  - Optional.
  - Type: `string` when supplied.
  - Length: Maximum **500 characters**.
- **`status`**:
  - Optional on creation (defaults to `pending`).
  - Allowed enum values: `pending`, `in-progress`, `completed`.
- **`priority`**:
  - Optional on creation (defaults to `medium`).
  - Allowed enum values: `low`, `medium`, `high`.
- **`:id` path parameter**:
  - Must be a valid positive integer (e.g., `1`, `2`).

---

## 10. Autonomic Defense & Security

1. **Authentication (AuthN)**:
   - Protected endpoints require an API token sent in the `Authorization` header:
     ```http
     Authorization: Bearer demo-user-key
     ```
     *(Or via `x-api-key: demo-user-key` header)*.
   - Missing or invalid tokens immediately reject with **`401 Unauthorized`**.

2. **Authorization (AuthZ)**:
   - **`user` role**: Can create (`POST`) and update (`PUT`) tasks.
   - **`admin` role**: Required for destructive actions (`DELETE /api/v1/tasks/:id`).
   - Normal users attempting admin operations are rejected with **`403 Forbidden`**.

3. **Rate Limiting**:
   - In-memory rate limiter tracks request counts per IP address.
   - Default: **30 requests per minute**.
   - Breaches immediately return **`429 Too Many Requests`** with `Retry-After` headers.

4. **Information Leak Prevention**:
   - Production errors do not disclose stack traces, local file system paths, or environment variables to clients.

---

## 11. Developer Studio (Interactive API Console)

The application includes an in-browser **Developer Studio** served directly by Express at:
👉 **`http://localhost:3000/`**

### Features:
- **Preset Quick-Test Scenarios**: Instant one-click triggers for all 8 HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `429`, `500`).
- **Custom Request Console**: Test any HTTP method (`GET`, `POST`, `PUT`, `DELETE`), custom paths, and custom payloads.
- **Authentication Switcher**: Rapidly switch between *No Auth*, *User Key*, *Admin Key*, and *Custom Token*.
- **Response Inspector**: Displays live status badges, high-resolution latency pulse, and syntax-highlighted JSON with a one-click copy button.
- **Live Database Records**: Real-time table of tasks currently stored in `data/db.json` with inline Edit and Delete actions.

---

## 12. OpenAPI 3.0 Documentation

- **Raw OpenAPI Specification**: Available at [`http://localhost:3000/openapi.yaml`](http://localhost:3000/openapi.yaml) or in [`docs/openapi.yaml`](docs/openapi.yaml).
- Can be imported directly into Swagger UI, Postman, Insomnia, or Redoc.

---

## 13. Automated Testing

The automated test suite runs via the native Node.js test runner:

```bash
npm test
```

### Test Suite Highlights:
- **29 Test Cases** covering 100% of endpoints, validation edge cases, and status codes:
  1. `GET /api/v1/health` → `200 OK`
  2. `GET /api/v1/tasks` → `200 OK` with task list
  3. `GET /api/v1/tasks/:id` → `200 OK` for existing task
  4. `GET /api/v1/tasks/:id` (nonexistent) → `404 Not Found`
  5. `GET /api/v1/tasks/:id` (string ID `abc`) → `400 Bad Request`
  6. `GET /api/v1/tasks/:id` (zero ID `0`) → `400 Bad Request`
  7. `GET /api/v1/tasks/:id` (negative ID `-5`) → `400 Bad Request`
  8. `POST /api/v1/tasks` (valid payload) → `201 Created`
  9. `POST /api/v1/tasks` (default values: `pending`, `medium`) → `201 Created`
  10. `POST /api/v1/tasks` (using `x-api-key` header) → `201 Created`
  11. `POST /api/v1/tasks` (missing title) → `400 Bad Request`
  12. `POST /api/v1/tasks` (title too short <3 chars) → `400 Bad Request`
  13. `POST /api/v1/tasks` (title too long >100 chars) → `400 Bad Request`
  14. `POST /api/v1/tasks` (description too long >500 chars) → `400 Bad Request`
  15. `POST /api/v1/tasks` (invalid status enum) → `400 Bad Request`
  16. `POST /api/v1/tasks` (invalid priority enum) → `400 Bad Request`
  17. `POST /api/v1/tasks` (wrong data type for title) → `400 Bad Request`
  18. `PUT /api/v1/tasks/:id` (valid update) → `200 OK`
  19. `PUT /api/v1/tasks/:id` (invalid status enum) → `400 Bad Request`
  20. `PUT /api/v1/tasks/:id` (empty body / no updatable fields) → `400 Bad Request`
  21. `PUT /api/v1/tasks/:id` (nonexistent task) → `404 Not Found`
  22. `POST /api/v1/tasks` (missing token) → `401 Unauthorized`
  23. `POST /api/v1/tasks` (invalid token) → `401 Unauthorized`
  24. `DELETE /api/v1/tasks/:id` (user key) → `403 Forbidden`
  25. `DELETE /api/v1/tasks/:id` (admin key) → `204 No Content`
  26. `DELETE /api/v1/tasks/:id` (already deleted) → `404 Not Found`
  27. `GET /api/v1/does-not-exist` (unknown route) → `404 Not Found`
  28. `POST /api/v1/simulate-error` → `500 Internal Server Error`
  29. Rapid requests burst → `429 Too Many Requests`
- **Test Isolation**: Runs against an isolated temporary database (`data/test-db.json`) that is created and destroyed cleanly, ensuring zero pollution of production data.

---

## 14. Production Readiness & Deployment

### Graceful Shutdown:
The application listens for `SIGINT` (Ctrl+C) and `SIGTERM` signals, closes active HTTP listeners cleanly, and flushes any pending file writes before exiting.

### Cloud Deployment (Render, Railway, Fly.io, Heroku):
1. Configure environment variables (`PORT`, `API_USER_KEY`, `API_ADMIN_KEY`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`).
2. Build command: None required (uses pure native Node.js).
3. Start command:
   ```bash
   node src/server.js
   ```

---

*DecodeLabs Industrial Training 2026 | Developed with Architectural Integrity.*
