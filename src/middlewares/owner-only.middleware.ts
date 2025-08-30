import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";
import { forbidden, notFound } from "../helpers/error";

export async function ownerOnly(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id;
  const taskId = req.params.id;

  const task = await TaskService.detail(taskId)
  if (!task) {
    throw notFound("Task not found")
  }

  if (task.authorId !== userId) {
    throw forbidden("You're not allowed to access this resource")
  }

  next();
}