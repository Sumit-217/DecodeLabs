import { errorResponse } from '../utils/response.js';

const ALLOWED_STATUSES = ['pending', 'in-progress', 'completed'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validate Task creation payload (POST)
 */
export function validateCreateTask(req, res, next) {
  const body = req.body;
  const fields = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Invalid request body. A JSON object is required.'
      )
    );
  }

  // 1. Title validation (Required)
  if (body.title === undefined || body.title === null) {
    fields.title = 'Title is required.';
  } else if (typeof body.title !== 'string') {
    fields.title = 'Title must be a string.';
  } else {
    const trimmedTitle = body.title.trim();
    if (trimmedTitle.length < 3) {
      fields.title = 'Title must be at least 3 characters long.';
    } else if (trimmedTitle.length > 100) {
      fields.title = 'Title cannot exceed 100 characters.';
    }
  }

  // 2. Description validation (Optional)
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      fields.description = 'Description must be a string when supplied.';
    } else if (body.description.length > 500) {
      fields.description = 'Description cannot exceed 500 characters.';
    }
  }

  // 3. Status validation (Optional)
  if (body.status !== undefined && body.status !== null) {
    if (typeof body.status !== 'string' || !ALLOWED_STATUSES.includes(body.status.toLowerCase())) {
      fields.status = `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`;
    }
  }

  // 4. Priority validation (Optional)
  if (body.priority !== undefined && body.priority !== null) {
    if (typeof body.priority !== 'string' || !ALLOWED_PRIORITIES.includes(body.priority.toLowerCase())) {
      fields.priority = `Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`;
    }
  }

  if (Object.keys(fields).length > 0) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Input validation failed. Please review the provided fields.',
        fields
      )
    );
  }

  next();
}

/**
 * Validate Task update payload (PUT)
 */
export function validateUpdateTask(req, res, next) {
  const body = req.body;
  const fields = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Invalid request body. A JSON object is required.'
      )
    );
  }

  // Check if at least one valid field is provided to update
  const hasUpdatableField = ['title', 'description', 'status', 'priority'].some(k => k in body);
  if (!hasUpdatableField) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'At least one field (title, description, status, priority) must be provided for update.'
      )
    );
  }

  // 1. Title validation if provided
  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      fields.title = 'Title must be a string.';
    } else {
      const trimmedTitle = body.title.trim();
      if (trimmedTitle.length < 3) {
        fields.title = 'Title must be at least 3 characters long.';
      } else if (trimmedTitle.length > 100) {
        fields.title = 'Title cannot exceed 100 characters.';
      }
    }
  }

  // 2. Description validation if provided
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      fields.description = 'Description must be a string when supplied.';
    } else if (body.description.length > 500) {
      fields.description = 'Description cannot exceed 500 characters.';
    }
  }

  // 3. Status validation if provided
  if (body.status !== undefined && body.status !== null) {
    if (typeof body.status !== 'string' || !ALLOWED_STATUSES.includes(body.status.toLowerCase())) {
      fields.status = `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`;
    }
  }

  // 4. Priority validation if provided
  if (body.priority !== undefined && body.priority !== null) {
    if (typeof body.priority !== 'string' || !ALLOWED_PRIORITIES.includes(body.priority.toLowerCase())) {
      fields.priority = `Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`;
    }
  }

  if (Object.keys(fields).length > 0) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Input validation failed. Please review the provided fields.',
        fields
      )
    );
  }

  next();
}

/**
 * Validate numeric ID parameter
 */
export function validateIdParam(req, res, next) {
  const id = req.params.id;
  const num = Number(id);

  if (!Number.isInteger(num) || num <= 0) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        `Invalid task ID '${id}'. ID must be a positive integer.`
      )
    );
  }

  next();
}
