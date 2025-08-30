import type { Request, Response } from 'express';
import z from 'zod';
import { TaskStatus } from '../db/schema';
import { TaskService } from '../services/task.service';
import { notFound } from '../helpers/error';

const tasksAllQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  status: z.enum(TaskStatus).optional(),
});

const taskBodySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500),
  status: z.enum(TaskStatus).default(TaskStatus.PENDING),
});

export class TaskController {
  static async all(req: Request, res: Response) {
    const { page, limit, status } = tasksAllQuerySchema.parse(req.query);

    const tasks = await TaskService.all(req.user.id, { page, limit, status });

    res.status(200).json(tasks);
  }

  static async create(req: Request, res: Response) {
    const body = taskBodySchema.parse(req.body);

    const task = await TaskService.create({
      title: body.title,
      description: body.description,
      status: body.status,
      authorId: req.user.id,
    });

    res.status(201).json(task);
  }

  static async detail(req: Request, res: Response) {
    const taskId = req.params.id;

    const task = await TaskService.detail(taskId);

    if (!task) {
      throw notFound("Task not found");
    }

    res.status(200).json(task);
  }
}
