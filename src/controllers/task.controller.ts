import type { Request, Response } from 'express';
import z from 'zod';
import { TaskStatus } from '../db/schema';
import { TaskService } from '../services/task.service';

const tasksAllQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  status: z.enum(TaskStatus).optional(),
});

const taskBodySchema = z.object({
  title: z
    .string('Title is required')
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must be at most 100 characters long'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters long')
    .optional(),
  status: z
    .enum(
      TaskStatus,
      `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
    )
    .default(TaskStatus.PENDING),
});

export class TaskController {
  static async all(req: Request, res: Response) {
    // Validate and parse query parameters
    const { page, limit, status } = tasksAllQuerySchema.parse(req.query);

    // Fetch tasks from the service
    const tasks = await TaskService.all(req.user.id, { page, limit, status });

    res.status(200).json(tasks);
  }

  static async create(req: Request, res: Response) {
    // Validate and parse request body
    const body = taskBodySchema.parse(req.body);

    // Create task using the service
    const task = await TaskService.create({
      title: body.title,
      description: body.description,
      status: body.status,
      authorId: req.user.id,
    });

    res.status(201).json(task);
  }

  static async detail(req: Request, res: Response) {
    res.status(200).json(req.task);
  }

  static async update(req: Request, res: Response) {
    // Validate and parse request body
    const body = taskBodySchema.parse(req.body);

    // Update task using the service
    const task = await TaskService.update(req.task.id, body);

    res.status(200).json(task);
  }

  static async delete(req: Request, res: Response) {
    // Delete task using the service
    await TaskService.delete(req.task.id);

    res.status(200).json({ message: 'Task deleted successfully' });
  }
}
