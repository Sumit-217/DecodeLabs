/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * Routes: Interns Resource & Error Diagnostics Sandbox
 */

import express from 'express';
import { run, get, all } from '../database/db.js';

const router = express.Router();

const VALID_TRACKS = [
  'Full Stack Development',
  'Frontend Engineering',
  'Backend Engineering',
  'Cloud & AI'
];

const VALID_STATUSES = ['Active', 'Graduated', 'On Leave'];

/**
 * GET /api/health
 * System Health Check & Telemetry
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: 'SQLite (WAL Mode Active)'
  });
});

/**
 * GET /api/interns
 * Retrieve all interns with optional search and multi-factor filtering
 * Query params: ?search=...&track=...&status=...
 */
router.get('/interns', (req, res, next) => {
  try {
    const { search, track, status } = req.query;

    let sql = 'SELECT * FROM interns WHERE 1=1';
    const params = [];

    // Filter by search query across name, role, email
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(role) LIKE ? OR LOWER(email) LIKE ?)';
      params.push(term, term, term);
    }

    // Filter by track
    if (track && track !== 'All') {
      sql += ' AND track = ?';
      params.push(track);
    }

    // Filter by status
    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY id DESC';

    const interns = all(sql, params);

    res.status(200).json({
      success: true,
      count: interns.length,
      data: interns
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/interns/:id
 * Retrieve single intern by ID
 */
router.get('/interns/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const intern = get('SELECT * FROM interns WHERE id = ?', [id]);

    if (!intern) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Intern with ID ${id} was not found.`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: intern
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/interns
 * Create a new intern record with server-side validation
 */
router.post('/interns', (req, res, next) => {
  try {
    const { name, role, email, track, status = 'Active' } = req.body;

    // Defensive Server-side Validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedRole = typeof role === 'string' ? role.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Full Name is required and must be at least 2 characters long.'
        }
      });
    }

    if (!trimmedRole || trimmedRole.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role / Position is required and must be at least 2 characters long.'
        }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'A valid email address is required.'
        }
      });
    }

    if (!VALID_TRACKS.includes(track)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid track. Must be one of: ${VALID_TRACKS.join(', ')}`
        }
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }
      });
    }

    // Insert into database
    const insertResult = run(
      'INSERT INTO interns (name, role, email, track, status) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, trimmedRole, trimmedEmail, track, status]
    );

    const createdIntern = get('SELECT * FROM interns WHERE id = ?', [insertResult.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Intern created successfully',
      data: createdIntern
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/interns/:id
 * Update an existing intern record
 */
router.put('/interns/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = get('SELECT * FROM interns WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Intern with ID ${id} was not found.`
        }
      });
    }

    const { name, role, email, track, status } = req.body;

    const updatedName = typeof name === 'string' ? name.trim() : existing.name;
    const updatedRole = typeof role === 'string' ? role.trim() : existing.role;
    const updatedEmail = typeof email === 'string' ? email.trim().toLowerCase() : existing.email;
    const updatedTrack = track || existing.track;
    const updatedStatus = status || existing.status;

    // Validation
    if (updatedName.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name must be at least 2 characters.' }
      });
    }

    if (updatedRole.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Role must be at least 2 characters.' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedEmail)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid email is required.' }
      });
    }

    if (!VALID_TRACKS.includes(updatedTrack)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid specialization track.' }
      });
    }

    if (!VALID_STATUSES.includes(updatedStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid status value.' }
      });
    }

    run(
      `UPDATE interns 
       SET name = ?, role = ?, email = ?, track = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [updatedName, updatedRole, updatedEmail, updatedTrack, updatedStatus, id]
    );

    const updatedIntern = get('SELECT * FROM interns WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Intern updated successfully',
      data: updatedIntern
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/interns/:id
 * Delete intern record from database
 */
router.delete('/interns/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = get('SELECT * FROM interns WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Intern with ID ${id} was not found.`
        }
      });
    }

    run('DELETE FROM interns WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Intern "${existing.name}" (ID: ${id}) deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/simulate-error/:type
 * Diagnostics endpoint for controlled error simulation
 */
router.get('/simulate-error/:type', (req, res, next) => {
  const { type } = req.params;

  if (type === '400') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SIMULATED_BAD_REQUEST',
        message: 'HTTP 400 Bad Request: Simulated missing required parameters.'
      }
    });
  }

  if (type === '404') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'SIMULATED_NOT_FOUND',
        message: 'HTTP 404 Not Found: Simulated query for non-existent resource.'
      }
    });
  }

  if (type === '500') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SIMULATED_SERVER_ERROR',
        message: 'HTTP 500 Internal Server Error: Simulated unexpected database crash.'
      }
    });
  }

  if (type === 'timeout') {
    // Delay 4000ms so client-side abort fires
    return setTimeout(() => {
      res.status(200).json({
        success: true,
        message: 'Delayed response completed.'
      });
    }, 4000);
  }

  res.status(400).json({
    success: false,
    error: {
      code: 'UNKNOWN_SIMULATION_TYPE',
      message: `Simulation type "${type}" is not recognized. Use 400, 404, 500, or timeout.`
    }
  });
});

export default router;
