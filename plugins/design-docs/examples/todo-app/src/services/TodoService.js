const { Todo } = require('../models/Todo');
const { Op } = require('sequelize');

class TodoService {
  async createTodo(userId, { title, description, priority, dueDate }) {
    return Todo.create({ title, description, priority, dueDate, userId });
  }

  async getTodos(userId, { completed, priority, page = 1, limit = 20 }) {
    const where = { userId };
    if (completed !== undefined) where.completed = completed;
    if (priority) where.priority = priority;

    const offset = (page - 1) * limit;
    const { rows, count } = await Todo.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { todos: rows, total: count, page, limit };
  }

  async getTodoById(userId, todoId) {
    const todo = await Todo.findOne({ where: { id: todoId, userId } });
    if (!todo) throw { status: 404, message: 'Todo not found' };
    return todo;
  }

  async updateTodo(userId, todoId, updates) {
    const todo = await this.getTodoById(userId, todoId);
    const allowed = ['title', 'description', 'priority', 'dueDate', 'completed'];
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowed.includes(key))
    );
    return todo.update(filtered);
  }

  async deleteTodo(userId, todoId) {
    const todo = await this.getTodoById(userId, todoId);
    await todo.destroy();
  }

  async getOverdueTodos(daysOverdue = 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOverdue);

    return Todo.findAll({
      where: {
        completed: false,
        dueDate: { [Op.lt]: cutoff },
      },
      order: [['dueDate', 'ASC']],
    });
  }
}

module.exports = new TodoService();
