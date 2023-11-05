// history-service.ts
import express, { Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import pgp from 'pg-promise';
const db = pgp()('postgres://username:password@localhost:5432/database');

interface HistoryEvent {
  userId: number;
  action: string;
  timestamp: Date;
}

const app: Express = express();
const port = 3001;

app.use(bodyParser.json());

// Логирование события создания пользователя
app.post('/history/user-created', async (req: Request, res: Response) => {
  const { userId } = req.body;
  const newEvent: HistoryEvent = {
    userId,
    action: 'user-created',
    timestamp: new Date(),
  };
  await db.none('INSERT INTO history(user_id, action, timestamp) VALUES($1, $2, $3)', [newEvent.userId, newEvent.action, newEvent.timestamp]);
  res.json(newEvent);
});

// Логирование события изменения пользователя
app.post('/history/user-updated', async (req: Request, res: Response) => {
  const { userId } = req.body;
  const newEvent: HistoryEvent = {
    userId,
    action: 'user-updated',
    timestamp: new Date(),
  };
  await db.none('INSERT INTO history(user_id, action, timestamp) VALUES($1, $2, $3)', [newEvent.userId, newEvent.action, newEvent.timestamp]);
  res.json(newEvent);
});

// Получение истории с фильтрами
app.get('/history', async (req: Request, res: Response) => {
    const userId = req.query.userId as string; // Explicit cast to string
    const page = (req.query.page as string) ?? '1'; // Default to '1' if undefined
    const pageSize = 10;
    const offset = (parseInt(page, 10) - 1) * pageSize || 0; // Explicit cast to number
  
    let query = 'SELECT * FROM history';
    const params: any[] = []; // Correct type for params
  
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
