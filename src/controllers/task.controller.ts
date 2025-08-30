import type { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  static async all(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const tasks = await TaskService.all(req.user.id, { page, limit });

    res.status(200).json(tasks);
  }
}
