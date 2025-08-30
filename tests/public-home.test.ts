import { describe, expect, it } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'

describe('Public GET / API Integration Tests', () => {
  it('should return welcome message on root endpoint', async () => {
    const response = await supertest(app)
      .get('/');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('message', 'Welcome to otaQku tasks management API');
  });
});
