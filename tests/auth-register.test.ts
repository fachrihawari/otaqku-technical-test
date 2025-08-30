import { beforeAll, describe, expect, it, vi } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'
import { db } from "../src/db/db";
import { users } from "../src/db/schema";
import { reset } from "drizzle-seed";

describe('Auth Register API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test data or environment
    await reset(db, { users })
  })

  it('should register a new user', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'auth-register-test@mail.com',
        password: 'password',
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Object)

    expect(response.body).toHaveProperty('id', expect.any(String));
    expect(response.body).toHaveProperty('email', 'auth-register-test@mail.com');
    expect(response.body).toHaveProperty('created_at', expect.any(String));
  });

  it('should not register a user with existing email', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'auth-register-test@mail.com',
        password: 'password',
      });

    expect(response.status).toBe(409);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Email already exists');
  });

  it('should not register a user with invalid email', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password',
      });

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      email: expect.arrayContaining(['Invalid email format']),
    });
  });

  it('should not register a user with weak password', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'auth-register-test@mail.com',
        password: 'weak',
      });

    expect(response.status).toBe(422);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Validation error');
    expect(response.body.details).toMatchObject({
      password: expect.arrayContaining(['Password must be at least 6 characters long']),
    });
  });
});