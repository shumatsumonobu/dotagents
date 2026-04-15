const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const todoService = require('../services/TodoService');

const router = express.Router();

router.use(authenticate);

// GET /api/todos — TODO一覧取得
router.get('/',
  query('completed').optional().isBoolean(),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await todoService.getTodos(req.user.id, req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/todos — TODO作成
router.post('/',
  body('title').notEmpty().isLength({ max: 255 }),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const todo = await todoService.createTodo(req.user.id, req.body);
      res.status(201).json(todo);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/todos/:id — TODO取得
router.get('/:id',
  param('id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const todo = await todoService.getTodoById(req.user.id, req.params.id);
      res.json(todo);
    } catch (err) {
      if (err.status === 404) return res.status(404).json({ error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/todos/:id — TODO更新
router.put('/:id',
  param('id').isInt(),
  body('title').optional().isLength({ max: 255 }),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601(),
  body('completed').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const todo = await todoService.updateTodo(req.user.id, req.params.id, req.body);
      res.json(todo);
    } catch (err) {
      if (err.status === 404) return res.status(404).json({ error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/todos/:id — TODO削除
router.delete('/:id',
  param('id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      await todoService.deleteTodo(req.user.id, req.params.id);
      res.status(204).end();
    } catch (err) {
      if (err.status === 404) return res.status(404).json({ error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
