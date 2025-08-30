import 'dotenv/config';

import express from 'express';
import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { swaggerServe, swaggerSetup } from './middlewares/swagger.middleware';
import { authRoutes } from './routes/auth.route';
import { publicRoutes } from './routes/public.route';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use('/api-docs', swaggerServe, swaggerSetup);
app.use(loggerMiddleware);

// Routes
app.use(publicRoutes);
app.use('/auth', authRoutes);

// Protected Routes
app.use(authMiddleware);
app.get('/try', (req, res) => {
  console.log(req.user); // Should log the authenticated user's info
  res.send('This is a protected route');
});

// Error Middlewares
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API Docs is running on http://localhost:${port}/api-docs`);
});
