import express from 'express';
import { TaskController } from '../controllers/task.controller';

const taskRoutes = express.Router();

taskRoutes.get('/', TaskController.all);

export { taskRoutes };
