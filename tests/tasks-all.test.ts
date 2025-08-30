import { beforeEach, describe, expect, it, afterEach } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users, tasks, TaskStatus } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/helpers/hash";
import { signToken } from "../src/helpers/jwt";

describe('Tasks GET /tasks API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  const testUser = {
    email: 'tasks-all-test@mail.com',
    password: 'password'
  };

  beforeEach(async () => {
    // Create user directly in database (faster than HTTP request)
    const hashedPassword = await hashPassword(testUser.password);
    const [createdUser] = await db
      .insert(users)
      .values({
        email: testUser.email,
        password: hashedPassword
      })
      .returning({ id: users.id, email: users.email });

    userId = createdUser.id;

    // Generate token directly (faster than HTTP request)
    userToken = await signToken({ sub: userId });
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(tasks).where(eq(tasks.authorId, userId));
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  it('should get all tasks for authenticated user', async () => {
    // Create test tasks directly in database (faster than HTTP requests)
    const testTasks = [
      { title: 'Task 1', description: 'Description 1', status: TaskStatus.PENDING },
      { title: 'Task 2', description: 'Description 2', status: TaskStatus.IN_PROGRESS },
      { title: 'Task 3', description: 'Description 3', status: TaskStatus.COMPLETED }
    ];

    await db.insert(tasks).values(
      testTasks.map(task => ({
        ...task,
        authorId: userId
      }))
    );

    const response = await supertest(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(3);

    // Check task structure
    response.body.forEach((task: any) => {
      expect(task).toHaveProperty('id', expect.any(String));
      expect(task).toHaveProperty('title', expect.any(String));
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('authorId', userId);
      expect(task).toHaveProperty('created_at', expect.any(String));
      expect(task).toHaveProperty('updated_at', expect.any(String));
      expect(['pending', 'in_progress', 'completed']).toContain(task.status);
    });
  });

  it('should return empty array when user has no tasks', async () => {
    const response = await supertest(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(0);
  });

  it('should return 401 when no authorization token provided', async () => {
    const response = await supertest(app)
      .get('/tasks');

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when invalid authorization token provided', async () => {
    const response = await supertest(app)
      .get('/tasks')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when malformed authorization header', async () => {
    const response = await supertest(app)
      .get('/tasks')
      .set('Authorization', 'InvalidFormat');

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should handle pagination with page parameter', async () => {
    // Create multiple tasks directly in database (faster than HTTP requests)
    const taskData = Array.from({ length: 15 }, (_, i) => ({
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      status: TaskStatus.PENDING,
      authorId: userId
    }));

    await db.insert(tasks).values(taskData);

    const response = await supertest(app)
      .get('/tasks?page=1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(10);
  });

  it('should handle pagination with limit parameter', async () => {
    // Create some tasks directly in database (faster than HTTP requests)
    const taskData = Array.from({ length: 8 }, (_, i) => ({
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      status: TaskStatus.PENDING,
      authorId: userId
    }));

    await db.insert(tasks).values(taskData);

    const response = await supertest(app)
      .get('/tasks?limit=5&page=2')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3);
  });

  it('should filter tasks by status', async () => {
    // Create tasks with different statuses directly in database
    const taskData = [
      { title: 'Pending Task', description: 'Test', status: TaskStatus.PENDING, authorId: userId },
      { title: 'In Progress Task', description: 'Test', status: TaskStatus.IN_PROGRESS, authorId: userId },
      { title: 'Completed Task', description: 'Test', status: TaskStatus.COMPLETED, authorId: userId }
    ];

    await db.insert(tasks).values(taskData);

    const response = await supertest(app)
      .get('/tasks?status=pending')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    
    if (response.body.length > 0) {
      response.body.forEach((task: any) => {
        expect(task.status).toBe('pending');
      });
    }
  });

  it('should only return tasks belonging to authenticated user', async () => {
    // Create another user directly in database
    const anotherUser = {
      email: 'tasks-all-test-another@mail.com',
      password: 'password'
    };

    const anotherUserHashedPassword = await hashPassword(anotherUser.password);
    const [anotherUserCreated] = await db
      .insert(users)
      .values({
        email: anotherUser.email,
        password: anotherUserHashedPassword
      })
      .returning({ id: users.id, email: users.email });

    const anotherUserId = anotherUserCreated.id;

    // Create tasks for both users directly in database
    const taskData = [
      { title: 'User 1 Task', description: 'Test', status: TaskStatus.PENDING, authorId: userId },
      { title: 'User 2 Task', description: 'Test', status: TaskStatus.PENDING, authorId: anotherUserId }
    ];

    await db.insert(tasks).values(taskData);

    // Get tasks for first user
    const response = await supertest(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].authorId).toBe(userId);
    expect(response.body[0].title).toBe('User 1 Task');

    // Cleanup
    await db.delete(tasks).where(eq(tasks.authorId, anotherUserId));
    await db.delete(users).where(eq(users.id, anotherUserId));
  });
});
