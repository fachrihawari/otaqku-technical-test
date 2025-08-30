import { beforeEach, describe, expect, it, afterEach } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users, tasks, TaskStatus } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/helpers/hash";
import { signToken } from "../src/helpers/jwt";

describe('Tasks DELETE /tasks/:id API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let anotherUserId: string;
  let taskId: string;
  let anotherUserTaskId: string;
  
  const testUser = {
    email: 'delete-task-user@mail.com',
    password: 'password123'
  };

  const anotherTestUser = {
    email: 'another-delete-task-user@mail.com',
    password: 'password456'
  };

  beforeEach(async () => {
    // Clean up existing data
    await db.delete(tasks).where(eq(tasks.authorId, userId));
    await db.delete(tasks).where(eq(tasks.authorId, anotherUserId));
    await db.delete(users).where(eq(users.email, testUser.email));
    await db.delete(users).where(eq(users.email, anotherTestUser.email));

    // Create main test user
    const hashedPassword = await hashPassword(testUser.password);
    const [createdUser] = await db
      .insert(users)
      .values({
        email: testUser.email,
        password: hashedPassword
      })
      .returning({ id: users.id, email: users.email });

    userId = createdUser.id;
    userToken = await signToken({ sub: userId });

    // Create another user for authorization tests
    const anotherHashedPassword = await hashPassword(anotherTestUser.password);
    const [anotherCreatedUser] = await db
      .insert(users)
      .values({
        email: anotherTestUser.email,
        password: anotherHashedPassword
      })
      .returning({ id: users.id, email: users.email });

    anotherUserId = anotherCreatedUser.id;

    // Create a test task for the main user
    const [createdTask] = await db
      .insert(tasks)
      .values({
        title: 'Task to be Deleted',
        description: 'This task will be deleted in tests',
        status: TaskStatus.PENDING,
        authorId: userId
      })
      .returning({ id: tasks.id });

    taskId = createdTask.id;

    // Create a test task for another user (for forbidden tests)
    const [anotherCreatedTask] = await db
      .insert(tasks)
      .values({
        title: 'Another User Task',
        description: 'Task belonging to another user',
        status: TaskStatus.PENDING,
        authorId: anotherUserId
      })
      .returning({ id: tasks.id });

    anotherUserTaskId = anotherCreatedTask.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (userId) {
      await db.delete(tasks).where(eq(tasks.authorId, userId));
      await db.delete(users).where(eq(users.id, userId));
    }
    if (anotherUserId) {
      await db.delete(tasks).where(eq(tasks.authorId, anotherUserId));
      await db.delete(users).where(eq(users.id, anotherUserId));
    }
  });

  it('should successfully delete a task owned by the user', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Task deleted successfully');

    // Verify task was actually deleted from database
    const deletedTaskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(deletedTaskInDb).toBeUndefined();
  });

  it('should return 401 when no authorization token provided', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${taskId}`);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');

    // Verify task still exists in database
    const taskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(taskInDb).toBeDefined();
  });

  it('should return 401 when invalid authorization token provided', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');

    // Verify task still exists in database
    const taskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(taskInDb).toBeDefined();
  });

  it('should return 401 when malformed authorization header', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', 'InvalidFormat');

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');

    // Verify task still exists in database
    const taskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(taskInDb).toBeDefined();
  });

  it('should return 403 when trying to delete another user\'s task', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${anotherUserTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', "You're not allowed to access this resource");

    // Verify task still exists in database (not deleted)
    const taskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, anotherUserTaskId)
    });

    expect(taskInDb).toBeDefined();
    expect(taskInDb?.authorId).toBe(anotherUserId);
  });

  it('should return 404 when task does not exist', async () => {
    const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';

    const response = await supertest(app)
      .delete(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Task not found');
  });
});
