import 'dotenv/config';

import express from 'express';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { swaggerServe, swaggerSetup } from './middlewares/swagger.middleware';
import { publicRoutes } from './routes/public.route';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(loggerMiddleware);
app.use('/api-docs', swaggerServe, swaggerSetup);

// Routes
app.use(publicRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API Docs is running on http://localhost:${port}/api-docs`);
});
