# DecodeLabs Industrial Training (Batch 2026)

Welcome to the **DecodeLabs Industrial Training** repository. This repository houses four progressive, modular engineering projects tracing the evolution from static web fundamentals to a full-stack, database-integrated production application.

---

## 📂 Curriculum Overview

| Project | Domain | Key Technologies | Description | Status |
| :--- | :--- | :--- | :--- | :---: |
| **[Project 1](./Project1)** | Frontend Foundations & Version Control | Semantic HTML5, CSS3, Git | Professional personal portfolio & technical resume demonstrating responsive web layouts. | **Completed** |
| **[Project 2](./Project2)** | Backend Architecture & REST APIs | Node.js, Express.js | Modular RESTful API server with routing, request validation, and semantic HTTP status codes. | **Completed** |
| **[Project 3](./Project3)** | Database Integration & Persistence | Express.js, SQLite (`DatabaseSync`), WAL | Relational database schema design, parameterized queries, and ACID-compliant CRUD operations. | **Completed** |
| **[Project 4](./Project4)** | Full-Stack Integration & Observability | Vanilla JS, Express.js, SQLite | Frameworkless **Intern Management Dashboard** uniting client, server, and persistent database with real-time telemetry. | **Completed** |

---

## 🚀 Project 4 Spotlight: Full-Stack Integration

**Project 4** is the capstone integration phase:

* **Frameworkless UI**: Built with pure **Semantic HTML5, Vanilla CSS3, and ES6+ JavaScript** using the **"Terra & Ether"** design system.
* **Unified Single-Process Host**: Express serves both the REST API (`/api/interns`) and the single-page application (`/`) simultaneously on `http://localhost:3002`.
* **Zero-Dependency Native SQLite**: Leverages Node's native `DatabaseSync` engine with Write-Ahead Logging (`WAL`), foreign keys, and check constraints.
* **Interactive 6-Stage IPO Lifecycle**: Visualizes real-time request flow:
  $$\text{INPUT} \longrightarrow \text{REQUEST SENT} \longrightarrow \text{SERVER PROCESSING} \longrightarrow \text{DATABASE} \longrightarrow \text{RESPONSE} \longrightarrow \text{DOM UPDATED}$$
* **API Diagnostics Sandbox**: Interactive developer suite to test defensive error handling against `400`, `404`, `500`, `Network Error`, and `Timeout` scenarios.
* **Strict XSS Immunity**: 100% of user data rendered safely via `document.createElement()` and `textContent`.

### Running Project 4
```bash
cd Project4
npm install
npm start
# Open http://localhost:3002 in your browser
```

---

## 🛠️ Global Verification & Testing

Each project operates completely independently with its own configuration, dependencies, and test suites:

```bash
# Run Project 3 tests (15 suites)
cd Project3 && npm test

# Run Project 4 tests (11 suites)
cd Project4 && npm test
```

---

## 📄 License
DecodeLabs Industrial Training Kit (Batch 2026). Developed by Sumit Kumar.
