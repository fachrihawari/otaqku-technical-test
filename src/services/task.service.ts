import { db } from '../db/db';

export type TaskAllOptions = {
  page: number;
  limit: number;
};
export class TaskService {
  static async all(authorId: string, options: TaskAllOptions) {
    const tasks = await db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.authorId, authorId),
      with: {
        author: {
          columns: {
            password: false,
          },
        },
      },
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
    });
    return tasks;
  }
}
