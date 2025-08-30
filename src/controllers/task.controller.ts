import type { Request, Response } from 'express';
import z from 'zod';
import { TaskStatus } from '../db/schema';
import { TaskService } from '../services/task.service';

const tasksAllQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  status: z.enum(TaskStatus).optional(),
});

export class TaskController {
  static async all(req: Request, res: Response) {
    const { page, limit, status } = tasksAllQuerySchema.parse(req.query);

    const tasks = await TaskService.all(req.user.id, { page, limit, status });

    res.status(200).json(tasks);
  }
}
