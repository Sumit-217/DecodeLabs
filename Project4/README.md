# DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration

**Batch**: 2026 Industrial Training Kit  
**Track**: Full Stack Web Development  
**Theme**: *"Building the Nervous System: Bridging the Gap from Isolated Scripts to Full-Stack Systems"*  
**Deliverable**: Production-grade, frameworkless **Intern Management Dashboard** demonstrating complete bidirectional integration across Client, Server, and Persistent Database.

---

## 1. Executive Summary

Project 4 is the **Unified Full-Stack Integration** phase of the DecodeLabs curriculum. It connects an interactive frontend user interface directly to an Express backend and an ACID-compliant SQLite database, demonstrating the complete **Input-Process-Output (IPO)** lifecycle:

```text
┌───────────────────────────┐         HTTP / Native fetch         ┌───────────────────────────┐         node:sqlite (WAL)         ┌───────────────────────────┐
│      Browser Client       │ ──────────────────────────────────▶ │    Express.js REST API    │ ────────────────────────────────▶ │    SQLite Persistent DB   │
│  public/index.html        │                                     │  src/server.js            │                                     │  database/project4.db     │
│  public/css/style.css     │ ◀────────────────────────────────── │  src/routes/interns.js    │ ◀──────────────────────────────── │  (ACID-compliant)         │
│  public/js/api.js, app.js │         JSON Response Payload       │  src/database/db.js       │         Parameterized Results     └───────────────────────────┘
└───────────────────────────┘                                     └───────────────────────────┘
```

### Core Architectural Principles
* **Pure Frameworkless Stack**: Built strictly with **Semantic HTML5, Vanilla CSS3, and Modern ES6+ JavaScript**. Zero frontend framework dependencies (No React, Vue, Angular, TypeScript, Tailwind, or Bootstrap).
* **Unified Single-Process Host**: Express serves both the RESTful API endpoints (`/api/*`) and the static single-page client application (`/`) simultaneously on `http://localhost:3002`.
* **Zero-Dependency Native SQLite**: Built on Node's native `DatabaseSync` engine (`node:sqlite`) with Write-Ahead Logging (`WAL`), parameterized statements (SQL injection immunity), check constraints, and performance indexes.
* **Strict XSS Immunity**: 100% of user-provided content is rendered safely using `document.createElement()` and `element.textContent`.
* **Defensive Error Handling**: Network failures, abort timeouts, schema violations, and API status codes are intercepted gracefully with non-blocking toast notifications and cleanup in `finally` blocks.

---

## 2. Dashboard Interface Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] DecodeLabs Intern Management       Dashboard   Interns   Integration Flow   Diagnostics  [● API Connected] │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                  │
│  INTERN MANAGEMENT                                                                     [ + Add Intern ]          │
│  Manage intern records through a unified frontend, REST API, and SQLite database.      API: localhost:3002/api   │
│  Pipeline: Frontend  →  REST API  →  Express Backend  →  SQLite DB                                               │
│                                                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │ TOTAL INTERNS        │  │ ACTIVE               │  │ GRADUATED            │  │ ON LEAVE             │          │
│  │ 6                    │  │ 3                    │  │ 2                    │  │ 1                    │          │
│  │ All registered       │  │ Currently training   │  │ Completed & placed   │  │ Temporary hiatus     │          │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Search by name, role, email... ]   [ All Tracks ▼ ]   [ All Statuses ▼ ]   [ Clear Filters ]   [ Refresh ⟳ ]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  INTERN                 ROLE                     TRACK                   EMAIL               STATUS    ACTIONS   │
│  (SK) Sumit Kumar       Full Stack Engineer      Full Stack Development  sumit@decodelabs... [Active]  Edit Del  │
│  (AP) Aarav Patel       Frontend Specialist      Frontend Engineering    aarav@decodelabs... [Active]  Edit Del  │
│  (DS) Diya Sharma       Backend Systems          Backend Engineering     diya@decodelabs...  [Grad.]   Edit Del  │
│  (RD) Rohan Deshmukh    Cloud & AI Associate     Cloud & AI              rohan@decodelabs... [Active]  Edit Del  │
│  (AR) Ananya Roy        Full Stack Core          Full Stack Development  ananya@decodelabs.. [Leave]   Edit Del  │
│  (VM) Vikram Mehta      API Integration          Backend Engineering     vikram@decodelabs.. [Grad.]   Edit Del  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  INTEGRATION FLOW (Real-Time Telemetry Stepper)                                                                  │
│  [1. INPUT] ──▶ [2. REQUEST SENT] ──▶ [3. SERVER PROCESSING] ──▶ [4. DATABASE] ──▶ [5. RESPONSE] ──▶ [6. DOM]    │
│                                                                                     [ Run Demo Flow ▶ ]          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  API DIAGNOSTICS SANDBOX                                                                                         │
│  [ 400 Bad Request ] [ 404 Not Found ] [ 500 Server Error ] [ Network Error ] [ Timeout (Abort) ]                │
│  Telemetry Inspector: Status Code • Recovery Strategy • Interception Logs                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```text
Project4/
├── .env.example                      # Environment variables template
├── .env                              # Local runtime configuration (PORT=3002)
├── .gitignore                        # Git exclusions (node_modules, .env, *.db)
├── package.json                      # Project metadata, dependencies & test scripts
├── README.md                         # Comprehensive documentation
│
├── database/
│   └── project4.db                   # Local SQLite database file (WAL mode)
│
├── src/                              # Backend Server Layer
│   ├── app.js                        # Express app factory, static router & middlewares
│   ├── server.js                     # HTTP listener & graceful shutdown lifecycle
│   ├── database/
│   │   ├── db.js                     # Native DatabaseSync provider, WAL pragma & seeds
│   │   └── schema.sql                # DDL defining interns table, constraints & indexes
│   ├── middleware/
│   │   └── errorHandler.js           # Centralized SQLite & HTTP error mapper
│   └── routes/
│       └── interns.js                # REST API endpoints & diagnostics sandbox
│
├── public/                           # Frontend Client Layer (Zero Frameworks)
│   ├── index.html                    # Single-Page Application (SPA) semantic layout
│   ├── css/
│   │   └── style.css                 # "Terra & Ether" design system & responsive layout
│   └── js/
│       ├── api.js                    # Encapsulated asynchronous fetch client with timeouts
│       └── app.js                    # State store, safe DOM injection, modals, toasts & stepper
│
└── tests/
    └── integration.test.js           # Automated end-to-end integration test suite
```

---

## 4. Visual Identity: "Terra & Ether" Design System

The visual design system blends warm grounding tones with crisp technical accents:

| Token | Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | Moonlit Grey Canvas | `#F9F8F5` | Main application viewport canvas |
| `--color-surface-subdued` | Moonlit Subdued Rail | `#F2F0EA` | Table headers, inset telemetry rails, badge wash |
| `--color-surface-card` | Pristine Card Surface | `#FFFFFF` | Metric cards, dialog containers, table rows |
| `--color-mocha-primary` | Mocha Mousse Deep | `#8C6D58` | Primary CTA buttons, focused borders, hero accents |
| `--color-mocha-hover` | Mocha Mousse Dark | `#765A46` | Primary button hover interaction |
| `--color-mocha-light` | Mocha Mousse Light | `#A8866F` | Avatar initial gradients, subtle badge wash |
| `--color-ethereal-blue` | Ethereal Slate Blue | `#4A709C` | Specialization track badges, telemetry links |
| `--color-ethereal-mist` | Ethereal Tint | `#A0B4E0` | Focus rings, secondary pill highlights |
| `--color-ink-primary` | Charcoal Ink | `#222120` | High-contrast body & header typography |
| `--color-ink-muted` | Charcoal Ink Muted | `#6B6864` | Secondary labels, hints, and timestamp metadata |

---

## 5. Comprehensive UI States Matrix

The application implements all 22 required UI states:

| # | State Description | Visual & Functional Behavior in Project 4 |
| :---: | :--- | :--- |
| **1** | **Normal Dashboard with Data** | Displays 4 dynamic metric cards, filter toolbar, and full 7-column data table. |
| **2** | **Initial Loading State** | Displays animated skeleton shimmer placeholders across table rows and cards. |
| **3** | **Empty Database State** | Friendly empty illustration with "No interns registered yet" and "Add Your First Intern". |
| **4** | **Search Results State** | Real-time debounced filtering updating rows and "Showing X of Y interns" tag. |
| **5** | **No Search Results State** | Centered empty search message with "Clear Filters" CTA to reset queries. |
| **6** | **Filtered Results State** | Active filter chips for Track and Status with reset actions. |
| **7** | **Add Intern Modal** | Clean dialog overlay with input fields, validation hints, and backdrop blur. |
| **8** | **Edit Intern Modal** | Pre-populates selected candidate details with focus on the first input. |
| **9** | **Delete Confirmation Dialog** | Danger dialog warning of permanent deletion with candidate name highlighted. |
| **10** | **Creating Loading State** | Submit button shows spinning indicator with text `"Creating..."` and disabled state. |
| **11** | **Saving Loading State** | Submit button shows spinning indicator with text `"Saving..."` and disabled state. |
| **12** | **Deleting Loading State** | Confirm button shows spinning indicator with text `"Deleting..."` and disabled state. |
| **13** | **Success Toast Alert** | Floating green alert with checkmark icon and auto-dismissal (`4.5s`). |
| **14** | **Validation Error Feedback** | Inline red border, error label below input, and warning toast notification. |
| **15** | **Duplicate Email Conflict (409)** | Centralized error handler maps unique constraint violation to inline email error. |
| **16** | **404 Not Found Handling** | Missing resource interceptor displays informative error toast and fallback card. |
| **17** | **500 Internal Server Error** | Caught defensively by try/catch blocks; displays toast and resets button state. |
| **18** | **Network Connection Error** | Handled by fetch abort/rejection; alerts user to verify backend server status. |
| **19** | **Request Timeout (Abort)** | Handled via `AbortController` after 8s (1.5s in diagnostics); non-blocking alert. |
| **20** | **API Connected / Disconnected** | Live header status pill: `● API Connected` (green) or `○ API Offline` (amber). |
| **21** | **Mobile Layout (< 900px)** | Transforms desktop table into high-density stacked cards with zero overflow. |
| **22** | **Tablet Layout (768px-1199px)** | Reflows statistics grid into 2 columns and stacks control toolbar neatly. |

---

## 6. REST API Specification

All endpoints communicate using standard JSON envelopes:

| Method | Endpoint | Success | Description |
| :--- | :--- | :---: | :--- |
| **`GET`** | `/api/health` | `200 OK` | System uptime, timestamp, and database engine health |
| **`GET`** | `/api/interns` | `200 OK` | Fetch all records with optional `?search=&track=&status=` filters |
| **`GET`** | `/api/interns/:id` | `200 OK` | Retrieve a single intern record by ID (or `404 Not Found`) |
| **`POST`** | `/api/interns` | `201 Created` | Create new intern with validation (or `400 Bad Request` / `409 Conflict`) |
| **`PUT`** | `/api/interns/:id` | `200 OK` | Update existing intern record by ID |
| **`DELETE`** | `/api/interns/:id` | `200 OK` | Remove intern record from persistent SQLite database |
| **`GET`** | `/api/simulate-error/:type` | `400/404/500` | Diagnostics sandbox (`400`, `404`, `500`, `timeout`) |

### JSON Data Envelope Example (`POST /api/interns`)
```json
// Request Body
{
  "name": "Sumit Kumar",
  "role": "Full Stack Engineer Intern",
  "email": "sumit.kumar@decodelabs.dev",
  "track": "Full Stack Development",
  "status": "Active"
}

// 201 Created Response
{
  "success": true,
  "message": "Intern created successfully",
  "data": {
    "id": 1,
    "name": "Sumit Kumar",
    "role": "Full Stack Engineer Intern",
    "email": "sumit.kumar@decodelabs.dev",
    "track": "Full Stack Development",
    "status": "Active",
    "created_at": "2026-09-16 11:40:00",
    "updated_at": "2026-09-16 11:40:00"
  }
}
```

---

## 7. Getting Started

### Prerequisites
* **Node.js**: v20.0.0 or higher (v22+ recommended for native `node:sqlite`)
* **npm**: v9.0.0 or higher

### Installation
```bash
# Navigate to Project 4 directory
cd Project4

# Install dependencies
npm install
```

### Running the Application
```bash
# Start the unified full-stack server
npm start

# Or start in watch mode for development
npm run dev
```

Visit the application in your browser:
```text
http://localhost:3002
```

### Running Automated Integration Tests
```bash
npm test
```

Expected output:
```text
✔ 1. GET /api/health should return system status and SQLite metadata
✔ 2. GET /api/interns should return seeded candidates list
✔ 3. GET /api/interns with search query should filter records
✔ 4. GET /api/interns with track filter should return matching track only
✔ 5. GET /api/interns/:id should return single intern or 404
✔ 6. POST /api/interns should create a new record and reject duplicates
✔ 7. POST /api/interns should enforce validation on invalid payload
✔ 8. PUT /api/interns/:id should update existing record
✔ 9. DELETE /api/interns/:id should delete record or return 404
✔ 10. GET /api/simulate-error routes should return controlled error responses
✔ 11. GET / should serve the frontend SPA index.html

11 passing (0 failures)
```

---

## 8. cURL Testing Commands

```bash
# 1. Health check
curl -X GET http://localhost:3002/api/health

# 2. Get all interns
curl -X GET http://localhost:3002/api/interns

# 3. Search interns
curl -X GET "http://localhost:3002/api/interns?search=Sumit"

# 4. Create new intern
curl -X POST http://localhost:3002/api/interns \
  -H "Content-Type: application/json" \
  -d '{"name":"Neha Sharma","role":"Frontend Developer","email":"neha@decodelabs.dev","track":"Frontend Engineering","status":"Active"}'

# 5. Update intern
curl -X PUT http://localhost:3002/api/interns/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Sumit Kumar","role":"Lead Full Stack Intern","email":"sumit.kumar@decodelabs.dev","track":"Full Stack Development","status":"Active"}'

# 6. Delete intern
curl -X DELETE http://localhost:3002/api/interns/6

# 7. Test error simulation
curl -X GET http://localhost:3002/api/simulate-error/400
curl -X GET http://localhost:3002/api/simulate-error/500
```

---

## 9. Educational Alignment & Evaluation Criteria

| Evaluation Requirement | Implementation Evidence in Project 4 |
| :--- | :--- |
| **Separation of Concerns** | `api.js` for network fetch, `app.js` for DOM & state, `server.js` for listener, `interns.js` for routes, `db.js` for persistence. |
| **Zero Frameworks** | Pure HTML5, CSS3, and ES6+ JavaScript. No third-party UI libraries or CSS frameworks. |
| **ACID Persistence** | SQLite table with check constraints, foreign keys, and Write-Ahead Logging (WAL). |
| **Idempotency & HTTP Codes** | Proper semantic HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Error`). |
| **Defensive Programming** | Server validation, client validation, AbortController timeouts, `try/catch/finally` blocks with loading state restoration. |
| **XSS Security** | Strict avoidance of `innerHTML` for dynamic content; exclusively uses `document.createElement()` and `textContent`. |
| **Full Stack Observability** | Interactive 6-stage IPO lifecycle stepper and developer API diagnostics sandbox. |

---

## 10. License
DecodeLabs Industrial Training Kit (Batch 2026). Developed for academic and industrial evaluation.
