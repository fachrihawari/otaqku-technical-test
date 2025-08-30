import express from 'express';
import { TaskController } from '../controllers/task.controller';
import { ownerOnly } from '../middlewares/owner-only.middleware';

const taskRoutes = express.Router();

taskRoutes.get('/', TaskController.all);
taskRoutes.post('/', TaskController.create);
taskRoutes.get('/:id', ownerOnly, TaskController.detail);

export { taskRoutes };
