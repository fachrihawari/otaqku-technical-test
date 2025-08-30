import 'dotenv/config';

import { apiReference } from '@scalar/express-api-reference';
import express from 'express';
import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { authRoutes } from './routes/auth.route';
import { publicRoutes } from './routes/public.route';
import { taskRoutes } from './routes/task.route';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use('/api-docs', apiReference({ url: '/openapi.json' }));
app.use(loggerMiddleware);

// Routes
app.use(publicRoutes);
app.use('/auth', authRoutes);

// Protected Routes
app.use(authMiddleware);
app.use('/tasks', taskRoutes);

// Error Middlewares
app.use(errorMiddleware);

// Start the server
const shouldListen = process.env.NODE_ENV !== 'test';

if (shouldListen) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`API Docs is running on http://localhost:${port}/api-docs`);
  });
}

export { app };
