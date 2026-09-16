import { taskService } from '../services/taskService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const taskController = {
  /**
   * GET /api/v1/tasks
   * Retrieve all tasks with optional query filters
   */
  getTasks(req, res) {
    const filters = {
      status: req.query.status,
      priority: req.query.priority
    };
    const tasks = taskService.getAllTasks(filters);
    return res.status(200).json(successResponse(tasks));
  },

  /**
   * GET /api/v1/tasks/:id
   * Retrieve single task by ID
   */
  getTaskById(req, res) {
    const id = req.params.id;
    const task = taskService.getTaskById(id);

    if (!task) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', `Task with ID ${id} not found`)
      );
    }

    return res.status(200).json(successResponse(task));
  },

  /**
   * POST /api/v1/tasks
   * Create a new task (201 Created)
   */
  createTask(req, res) {
    const newTask = taskService.createTask(req.body);
    return res.status(201).json(successResponse(newTask));
  },

  /**
   * PUT /api/v1/tasks/:id
   * Update an existing task (200 OK)
   */
  updateTask(req, res) {
    const id = req.params.id;
    const updated = taskService.updateTask(id, req.body);

    if (!updated) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', `Task with ID ${id} not found`)
      );
    }

    return res.status(200).json(successResponse(updated));
  },

  /**
   * DELETE /api/v1/tasks/:id
   * Remove a task (204 No Content on success, 404 if not found)
   */
  deleteTask(req, res) {
    const id = req.params.id;
    const deleted = taskService.deleteTask(id);

    if (!deleted) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', `Task with ID ${id} not found`)
      );
    }

    // Spec: "Do not return a JSON body for a successful 204 response."
    return res.status(204).end();
  }
};
