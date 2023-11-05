// user-service.js
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:postgres@localhost:5432/postgres');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// 1. Создание пользователя
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await db.one('INSERT INTO users(name, email) VALUES($1, $2) RETURNING id, name, email', [name, email]);
    res.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// 2. Изменение пользователя с отправкой JSON-данных
app.put('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, email, userData } = req.body; // Добавляем userData из запроса

  // Обновление пользователя
  const updatedUser = await db.one(
    'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *',
    [name, email, userId]
  );

  // Отправка события изменения пользователя в history-service
  await fetch('http://localhost:3001/history/user-updated', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, userData }),
  });

  res.json(updatedUser);
});

// 3. Получение списка пользователей
app.get('/users', async (req, res) => {
  try {
    const users = await db.any('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});
