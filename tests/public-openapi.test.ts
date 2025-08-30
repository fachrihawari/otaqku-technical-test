import { describe, expect, it } from "vitest";
import supertest from 'supertest'
import { app } from '../src/server'

describe('Public GET /openapi.json API Integration Tests', () => {
  it('should return OpenAPI specification', async () => {
    const response = await supertest(app)
      .get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.headers).toHaveProperty('content-type', expect.stringContaining('application/json'));
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('info');
    expect(response.body).toHaveProperty('paths');
    expect(response.body.info).toHaveProperty('title');
    expect(response.body.info).toHaveProperty('version');
  });
});
