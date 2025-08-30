import { beforeEach, describe, expect, it, afterEach } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users, tasks, TaskStatus } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/helpers/hash";
import { signToken } from "../src/helpers/jwt";

describe('Tasks POST /tasks API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  const testUser = {
    email: 'create-task-user@mail.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Clean up and create fresh test user with auth token
    await db.delete(tasks).where(eq(tasks.authorId, userId));
    await db.delete(users).where(eq(users.email, testUser.email));

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
    if (userId) {
      await db.delete(tasks).where(eq(tasks.authorId, userId));
      await db.delete(users).where(eq(users.id, userId));
    }
  });

  it('should create a new task with all fields', async () => {
    const newTask = {
      title: 'Sample Task',
      description: 'This is a sample task description.',
      status: 'in_progress'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object);

    expect(response.body).toHaveProperty('id', expect.any(String));
    expect(response.body).toHaveProperty('title', newTask.title);
    expect(response.body).toHaveProperty('description', newTask.description);
    expect(response.body).toHaveProperty('status', newTask.status);
    expect(response.body).toHaveProperty('authorId', userId);
    expect(response.body).toHaveProperty('created_at', expect.any(String));
    expect(response.body).toHaveProperty('updated_at', expect.any(String));

    // Verify task was actually created in database
    const createdTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, response.body.id)
    });

    expect(createdTask).toBeDefined();
    expect(createdTask?.title).toBe(newTask.title);
    expect(createdTask?.description).toBe(newTask.description);
    expect(createdTask?.status).toBe(newTask.status);
    expect(createdTask?.authorId).toBe(userId);
  });

  it('should create a new task with only required fields', async () => {
    const newTask = {
      title: 'Minimum Task'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object);

    expect(response.body).toHaveProperty('id', expect.any(String));
    expect(response.body).toHaveProperty('title', newTask.title);
    expect(response.body).toHaveProperty('authorId', userId);
    expect(response.body).toHaveProperty('created_at', expect.any(String));
    expect(response.body).toHaveProperty('updated_at', expect.any(String));

    // Should allow null or empty string
    expect(response.body).toHaveProperty('description', expect.toBeOneOf([null, '']));
    // Should have default status
    expect(response.body).toHaveProperty('status', 'pending');
  });

  it('should create tasks with valid status values', async () => {
    const validStatuses = ['pending', 'in_progress', 'completed'];

    for (const status of validStatuses) {
      const newTask = {
        title: `Task with ${status} status`,
        description: `Testing ${status} status`,
        status: status
      };

      const response = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', status);
    }
  });

  it('should return 401 when no authorization token provided', async () => {
    const newTask = {
      title: 'Unauthorized Task',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .post('/tasks')
      .send(newTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when invalid authorization token provided', async () => {
    const newTask = {
      title: 'Invalid Token Task',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', 'Bearer invalid-token')
      .send(newTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when malformed authorization header', async () => {
    const newTask = {
      title: 'Malformed Auth Task',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', 'InvalidFormat')
      .send(newTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 422 when title is missing', async () => {
    const newTask = {
      description: 'Task without title',
      status: 'pending'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title is required']
    })
  });

  it('should return 422 when title is empty string', async () => {
    const newTask = {
      title: '',
      description: 'Task with empty title'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title must be at least 3 characters long']
    })
  });

  it('should return 422 when status is invalid', async () => {
    const newTask = {
      title: 'Task with invalid status',
      description: 'Testing invalid status',
      status: 'invalid_status'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      status: ['Status must be one of: ' + Object.values(TaskStatus).join(", ")]
    })
  });

  it('should return 422 when request body is empty', async () => {
    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title is required']
    })
  });

  it('should handle very long title', async () => {
    const longTitle = 'a'.repeat(101);
    const newTask = {
      title: longTitle,
      description: 'Task with very long title'
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title must be at most 100 characters long']
    })
  });

  it('should handle very long description', async () => {
    const longDescription = 'a'.repeat(501);
    const newTask = {
      title: 'Task with long description',
      description: longDescription
    };

    const response = await supertest(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      description: ['Description must be at most 500 characters long']
    })
  });
});
