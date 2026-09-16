import { readDb, writeDb, initDb } from '../data/db.js';

export const taskRepository = {
  /**
   * Retrieve all tasks with optional status and priority filtering
   * @param {object} [filters={}]
   * @returns {Array} List of task records
   */
  getAll(filters = {}) {
    const db = readDb();
    let tasks = [...db.tasks];

    if (filters.status) {
      tasks = tasks.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.priority) {
      tasks = tasks.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    return tasks;
  },

  /**
   * Find a single task by ID
   * @param {number|string} id 
   * @returns {object|null}
   */
  getById(id) {
    const numId = Number(id);
    const db = readDb();
    const task = db.tasks.find(t => t.id === numId);
    return task || null;
  },

  /**
   * Create and persist a new task
   * @param {object} taskData 
   * @returns {object} Created task
   */
  create(taskData) {
    const db = readDb();
    const newId = db.metadata.nextTaskId || (db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1);
    const now = new Date().toISOString();

    const newTask = {
      id: newId,
      title: taskData.title,
      description: taskData.description !== undefined ? taskData.description : "",
      status: taskData.status || "pending",
      priority: taskData.priority || "medium",
      createdAt: now,
      updatedAt: now
    };

    db.tasks.push(newTask);
    db.metadata.nextTaskId = newId + 1;
    writeDb(db);

    return newTask;
  },

  /**
   * Update an existing task by ID
   * @param {number|string} id 
   * @param {object} updates 
   * @returns {object|null} Updated task or null if not found
   */
  update(id, updates) {
    const numId = Number(id);
    const db = readDb();
    const index = db.tasks.findIndex(t => t.id === numId);

    if (index === -1) {
      return null;
    }

    const current = db.tasks[index];
    const now = new Date().toISOString();

    const updatedTask = {
      ...current,
      title: updates.title !== undefined ? updates.title : current.title,
      description: updates.description !== undefined ? updates.description : current.description,
      status: updates.status !== undefined ? updates.status : current.status,
      priority: updates.priority !== undefined ? updates.priority : current.priority,
      updatedAt: now
    };

    db.tasks[index] = updatedTask;
    writeDb(db);

    return updatedTask;
  },

  /**
   * Delete a task by ID
   * @param {number|string} id 
   * @returns {boolean} True if deleted, false if not found
   */
  delete(id) {
    const numId = Number(id);
    const db = readDb();
    const initialCount = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== numId);

    if (db.tasks.length === initialCount) {
      return false;
    }

    writeDb(db);
    return true;
  },

  /**
   * Reset database with given tasks and metadata
   * @param {object} [customData]
   */
  reset(customData) {
    initDb(customData || { tasks: [], metadata: { nextTaskId: 1 } });
  }
};
