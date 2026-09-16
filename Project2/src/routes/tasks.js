import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateCreateTask, validateUpdateTask, validateIdParam } from '../middleware/validator.js';

const router = Router();

/**
 * GET /api/v1/tasks
 * Public endpoint to retrieve all tasks
 */
router.get('/', taskController.getTasks);

/**
 * GET /api/v1/tasks/:id
 * Public endpoint to retrieve single task by ID
 */
router.get('/:id', validateIdParam, taskController.getTaskById);

/**
 * POST /api/v1/tasks
 * Protected endpoint (User or Admin) to create a new task
 */
router.post(
  '/',
  authenticate,
  validateCreateTask,
  taskController.createTask
);

/**
 * PUT /api/v1/tasks/:id
 * Protected endpoint (User or Admin) to update an existing task
 */
router.put(
  '/:id',
  authenticate,
  validateIdParam,
  validateUpdateTask,
  taskController.updateTask
);

/**
 * DELETE /api/v1/tasks/:id
 * Protected endpoint (Admin Only) to delete a task
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validateIdParam,
  taskController.deleteTask
);

export default router;
