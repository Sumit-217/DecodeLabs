import { Router } from 'express';
import { run, get, all } from '../database/db.js';

const router = Router();

/**
 * Helper: Validate and parse numeric ID param
 */
function parseIdParam(req, res) {
  const idStr = req.params.id;
  const id = Number.parseInt(idStr, 10);
  if (!idStr || Number.isNaN(id) || id <= 0 || String(id) !== idStr.trim()) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID parameter: must be a positive integer'
    });
    return null;
  }
  return id;
}

/**
 * Helper: Validate item input payload
 */
function validateItemInput(body) {
  const { name, category, price, description, in_stock } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return "Validation failed: 'name' is required and must be a non-empty string";
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return "Validation failed: 'category' is required and must be a non-empty string";
  }

  if (price === undefined || price === null || typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    return "Validation failed: 'price' is required and must be a non-negative number";
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return "Validation failed: 'description' must be a string";
  }

  if (in_stock !== undefined && in_stock !== null) {
    if (typeof in_stock !== 'boolean' && in_stock !== 0 && in_stock !== 1) {
      return "Validation failed: 'in_stock' must be a boolean (true/false) or integer (1/0)";
    }
  }

  return null;
}

/**
 * POST /api/items
 * Create a new item in the database
 */
router.post('/', (req, res, next) => {
  try {
    const validationError = validateItemInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    const { name, category, price, description = null, in_stock = 1 } = req.body;
    const stockVal = typeof in_stock === 'boolean' ? (in_stock ? 1 : 0) : in_stock;

    const result = run(
      'INSERT INTO items (name, description, category, price, in_stock) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description ? description.trim() : null, category.trim(), price, stockVal]
    );

    const insertedId = result.lastInsertRowid;
    const createdItem = get('SELECT * FROM items WHERE id = ?', [insertedId]);

    return res.status(201).json({
      success: true,
      data: createdItem
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/items
 * Retrieve all items from the database
 */
router.get('/', (req, res, next) => {
  try {
    const items = all('SELECT * FROM items ORDER BY id ASC');
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/items/:id
 * Retrieve a single item by ID
 */
router.get('/:id', (req, res, next) => {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return;

    const item = get('SELECT * FROM items WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: `Item not found with id: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/items/:id
 * Update an existing item by ID
 */
router.put('/:id', (req, res, next) => {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return;

    // Check existence
    const existing = get('SELECT * FROM items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Item not found with id: ${id}`
      });
    }

    const validationError = validateItemInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    const { name, category, price, description = null, in_stock = 1 } = req.body;
    const stockVal = typeof in_stock === 'boolean' ? (in_stock ? 1 : 0) : in_stock;

    run(
      `UPDATE items 
       SET name = ?, description = ?, category = ?, price = ?, in_stock = ?, updated_at = datetime('now') 
       WHERE id = ?`,
      [name.trim(), description ? description.trim() : null, category.trim(), price, stockVal, id]
    );

    const updatedItem = get('SELECT * FROM items WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/items/:id
 * Delete an existing item by ID
 */
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return;

    const existing = get('SELECT * FROM items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Item not found with id: ${id}`
      });
    }

    run('DELETE FROM items WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: existing
    });
  } catch (err) {
    next(err);
  }
});

export default router;
