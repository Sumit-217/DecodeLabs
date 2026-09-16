import { taskRepository } from '../repositories/taskRepository.js';

export const taskService = {
  /**
   * Fetch all tasks with optional filters
   * @param {object} filters 
   * @returns {Array}
   */
  getAllTasks(filters = {}) {
    return taskRepository.getAll(filters);
  },

  /**
   * Fetch a task by ID
   * @param {number|string} id 
   * @returns {object|null}
   */
  getTaskById(id) {
    return taskRepository.getById(id);
  },

  /**
   * Create a new task
   * @param {object} taskData 
   * @returns {object}
   */
  createTask(taskData) {
    // Normalization & business defaults
    const payload = {
      title: taskData.title.trim(),
      description: typeof taskData.description === 'string' ? taskData.description.trim() : "",
      status: taskData.status || "pending",
      priority: taskData.priority || "medium"
    };

    return taskRepository.create(payload);
  },

  /**
   * Update an existing task
   * @param {number|string} id 
   * @param {object} updates 
   * @returns {object|null}
   */
  updateTask(id, updates) {
    const existing = taskRepository.getById(id);
    if (!existing) {
      return null;
    }

    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;

    return taskRepository.update(id, payload);
  },

  /**
   * Delete task by ID
   * @param {number|string} id 
   * @returns {boolean}
   */
  deleteTask(id) {
    return taskRepository.delete(id);
  }
};
