const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/User');
const { generateToken, authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/users/register — ユーザー登録
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty().isLength({ max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const existing = await User.findOne({ where: { email: req.body.email } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const user = await User.create(req.body);
      const token = generateToken(user);
      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/users/login — ログイン
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user || !(await user.validatePassword(req.body.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/users/me — 自分の情報取得
router.get('/me', authenticate, async (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role });
});

// GET /api/users — ユーザー一覧（admin only）
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'email', 'name', 'role', 'createdAt'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
