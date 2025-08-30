import type { NextFunction, Request, Response } from 'express';
import { forbidden, notFound } from '../helpers/error';
import { TaskService } from '../services/task.service';

export async function ownerOnly(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const userId = req.user.id;
  const taskId = req.params.id;

  const task = await TaskService.detail(taskId);
  if (!task) {
    throw notFound('Task not found');
  }

  if (task.authorId !== userId) {
    throw forbidden("You're not allowed to access this resource");
  }

  req.task = task;

  next();
}
