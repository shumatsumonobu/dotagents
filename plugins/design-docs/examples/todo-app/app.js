const express = require('express');
const path = require('path');
const { sequelize } = require('./src/models/Todo');
require('./src/models/User');
const todosRouter = require('./src/routes/todos');
const usersRouter = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/pages')));

app.use('/api/todos', todosRouter);
app.use('/api/users', usersRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`TODO app running on http://localhost:${PORT}`);
  });
});

module.exports = app;
