import { db } from '../db/db';
import type { TaskStatus } from '../db/schema';

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
}
