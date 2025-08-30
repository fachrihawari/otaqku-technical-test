import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { tasks } from '../db/schema';
import type { TaskStatus, TaskBody } from '../db/schema';

export type TaskAllOptions = {
  page: number;
  limit: number;
  status?: TaskStatus;
};

export class TaskService {
  static async all(authorId: string, options: TaskAllOptions) {
    const tasks = await db.query.tasks.findMany({
      where: (tasks, { eq, and }) =>
        and(
          eq(tasks.authorId, authorId),
          options.status ? eq(tasks.status, options.status) : undefined,
        ),
      with: {
        author: {
          columns: {
            password: false,
          },
        },
      },
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      orderBy: (tasks, { desc }) => [desc(tasks.created_at)],
    });
    return tasks;
  }

  static async create(body: TaskBody) {
    const [task] = await db.insert(tasks).values(body).returning();
    return task;
  }

  static async update(id: string, body: Omit<TaskBody, 'authorId'>) {
    const [task] = await db.update(tasks).set(body).where(eq(tasks.id, id)).returning();
    return task;
  }

  static async delete(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  static async detail(id: string) {
    return await db.query.tasks.findFirst({ where: (tasks, { eq }) => eq(tasks.id, id) });
  }
}
