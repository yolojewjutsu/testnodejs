// history-service.js
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:postgres@localhost:5432/postgres');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Логирование события создания пользователя
app.post('/history/user-created', async (req, res) => {
  const { userId } = req.body;
  const newEvent = {
    userId,
    action: 'user-created',
    timestamp: new Date(),
  };
  await db.none('INSERT INTO history(user_id, action, timestamp) VALUES($1, $2, $3)', [newEvent.userId, newEvent.action, newEvent.timestamp]);
  res.json(newEvent);
});

// Логирование события изменения пользователя
app.post('/history/user-updated', async (req, res) => {
  const { userId } = req.body;
  const newEvent = {
    userId,
    action: 'user-updated',
    timestamp: new Date(),
  };
  await db.none('INSERT INTO history(user_id, action, timestamp) VALUES($1, $2, $3)', [newEvent.userId, newEvent.action, newEvent.timestamp]);
  res.json(newEvent);
});

// Получение истории с фильтрами
app.get('/history', async (req, res) => {
  const { userId, page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize || 0;

  let query = 'SELECT * FROM history';
  const params = [];

  if (userId) {
    query += ' WHERE user_id=$1';
    params.push(userId);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${pageSize} OFFSET ${offset}`;

  const history = await db.any(query, params);
  res.json(history);
});

app.listen(port, () => {
  console.log(`History Service listening at http://localhost:${port}`);
});
