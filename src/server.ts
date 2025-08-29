import 'dotenv/config';

import express from 'express';
import { logger } from './middlewares/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(logger);

app.get('/', (req, res) => {
  req.log.info('Root endpoint accessed');
  res.send('Welcome to otaQku tasks management API');
});
app.get('/tasks', (_, res) => {
  res.send('Welcome tasks list');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
