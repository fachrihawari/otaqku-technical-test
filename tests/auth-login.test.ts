import { beforeAll, describe, expect, it } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users } from "../src/db/schema";
import { reset } from "drizzle-seed";
import { hashPassword } from "../src/helpers/hash";

describe('Auth Login API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test data or environment
    await reset(db, { users })

    await db.insert(users).values({
      email: 'test@mail.com',
      password: await hashPassword('password'),
    })

  })

  it('should login an existing user', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'test@mail.com',
        password: 'password',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('accessToken', expect.any(String));
  });

  it('should not login a user with empty email', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: '',
        password: 'wrong-password',
      });

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      email: expect.arrayContaining(['Invalid email format']),
    });
  });


  it('should not login a user with short password', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'test@mail.com',
        password: 'pass',
      });

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      password: expect.arrayContaining(['Password must be at least 6 characters long']),
    });
  });

  it('should not login a user with incorrect password', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'test@mail.com',
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should not login a user with unregistered email', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'unregistered@mail.com',
        password: 'password',
      });

    expect(response.status).toBe(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });
});
