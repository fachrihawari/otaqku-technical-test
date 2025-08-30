import { beforeEach, describe, expect, it, afterEach } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users, tasks, TaskStatus } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/helpers/hash";
import { signToken } from "../src/helpers/jwt";

describe('Tasks PUT /tasks/:id API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let anotherUserId: string;
  let taskId: string;
  let anotherUserTaskId: string;
  
  const testUser = {
    email: 'update-task-user@mail.com',
    password: 'password123'
  };

  const anotherTestUser = {
    email: 'another-update-task-user@mail.com',
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
        title: 'Original Task Title',
        description: 'Original task description',
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

  it('should update a task with all fields', async () => {
    const updatedTask = {
      title: 'Updated Task Title',
      description: 'Updated task description',
      status: 'in_progress'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);

    expect(response.body).toHaveProperty('id', taskId);
    expect(response.body).toHaveProperty('title', updatedTask.title);
    expect(response.body).toHaveProperty('description', updatedTask.description);
    expect(response.body).toHaveProperty('status', updatedTask.status);
    expect(response.body).toHaveProperty('authorId', userId);
    expect(response.body).toHaveProperty('created_at', expect.any(String));
    expect(response.body).toHaveProperty('updated_at', expect.any(String));

    // Verify task was actually updated in database
    const updatedTaskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(updatedTaskInDb).toBeDefined();
    expect(updatedTaskInDb?.title).toBe(updatedTask.title);
    expect(updatedTaskInDb?.description).toBe(updatedTask.description);
    expect(updatedTaskInDb?.status).toBe(updatedTask.status);
    expect(updatedTaskInDb?.authorId).toBe(userId);
  });

  it('should update a task with only title (required field)', async () => {
    const updatedTask = {
      title: 'Updated Title Only'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);

    expect(response.body).toHaveProperty('id', taskId);
    expect(response.body).toHaveProperty('title', updatedTask.title);
    expect(response.body).toHaveProperty('authorId', userId);
    expect(response.body).toHaveProperty('created_at', expect.any(String));
    expect(response.body).toHaveProperty('updated_at', expect.any(String));

    // Verify task was actually updated in database
    const updatedTaskInDb = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    });

    expect(updatedTaskInDb).toBeDefined();
    expect(updatedTaskInDb?.title).toBe(updatedTask.title);
  });

  it('should update tasks with valid status values', async () => {
    const validStatuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];

    for (const status of validStatuses) {
      const updatedTask = {
        title: `Updated Task with ${status} status`,
        description: `Testing ${status} status update`,
        status: status
      };

      const response = await supertest(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', status);

      // Verify in database
      const updatedTaskInDb = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId)
      });
      expect(updatedTaskInDb?.status).toBe(status);
    }
  });

  it('should return 401 when no authorization token provided', async () => {
    const updatedTask = {
      title: 'Unauthorized Update',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .send(updatedTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when invalid authorization token provided', async () => {
    const updatedTask = {
      title: 'Invalid Token Update',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', 'Bearer invalid-token')
      .send(updatedTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 401 when malformed authorization header', async () => {
    const updatedTask = {
      title: 'Malformed Auth Update',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', 'InvalidFormat')
      .send(updatedTask);

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid token');
  });

  it('should return 403 when trying to update another user\'s task', async () => {
    const updatedTask = {
      title: 'Forbidden Update',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .put(`/tasks/${anotherUserTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', "You're not allowed to access this resource");
  });

  it('should return 404 when task does not exist', async () => {
    const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440000';
    const updatedTask = {
      title: 'Update Non-existent Task',
      description: 'This should fail'
    };

    const response = await supertest(app)
      .put(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Task not found');
  });

  it('should return 422 when title is missing', async () => {
    const updatedTask = {
      description: 'Task without title',
      status: 'pending'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title is required']
    });
  });

  it('should return 422 when title is empty string', async () => {
    const updatedTask = {
      title: '',
      description: 'Task with empty title'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title must be at least 3 characters long']
    });
  });

  it('should return 422 when status is invalid', async () => {
    const updatedTask = {
      title: 'Task with invalid status',
      description: 'Testing invalid status',
      status: 'invalid_status'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      status: ['Status must be one of: ' + Object.values(TaskStatus).join(", ")]
    });
  });

  it('should return 422 when request body is empty', async () => {
    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title is required']
    });
  });

  it('should handle very long title', async () => {
    const longTitle = 'a'.repeat(101);
    const updatedTask = {
      title: longTitle,
      description: 'Task with very long title'
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      title: ['Title must be at most 100 characters long']
    });
  });

  it('should handle very long description', async () => {
    const longDescription = 'a'.repeat(501);
    const updatedTask = {
      title: 'Task with long description',
      description: longDescription
    };

    const response = await supertest(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedTask);

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      description: ['Description must be at most 500 characters long']
    });
  });
});
