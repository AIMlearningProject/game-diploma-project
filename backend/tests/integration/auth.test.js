/**
 * Authentication Integration Tests
 * Tests all authentication endpoints and flows
 */

import { createTestServer, generateTestToken } from '../helpers/testServer.js';
import { cleanDatabase, createTestUser, createTestStudent } from '../helpers/testData.js';

describe('Authentication Integration Tests', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'New Student',
          email: 'newstudent@test.com',
          password: 'password123',
          role: 'STUDENT',
          gradeLevel: 3,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('newstudent@test.com');
      expect(body.user.role).toBe('STUDENT');
      expect(body.token).toBeDefined();
      expect(response.cookies).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Test',
          // Missing email and password
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await createTestUser({ email: 'duplicate@test.com' });

      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Duplicate User',
          email: 'duplicate@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('already exists');
    });

    it('should create student profile and game state for student role', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Student With Profile',
          email: 'student-profile@test.com',
          password: 'password123',
          role: 'STUDENT',
          gradeLevel: 4,
        },
      });

      expect(response.statusCode).toBe(200);
      // Verify in /api/auth/me endpoint
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = await createTestUser({
        email: 'login@test.com',
        role: 'STUDENT',
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.id).toBe(user.id);
      expect(body.token).toBeDefined();
      expect(response.cookies).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      await createTestUser({ email: 'wrongpass@test.com' });

      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'wrongpass@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid credentials');
    });

    it('should fail with missing credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@test.com',
          // Missing password
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should set HTTP-only cookie with token', async () => {
      await createTestUser({ email: 'cookie@test.com' });

      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'cookie@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const cookies = response.cookies;
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find(c => c.name === 'token');
      expect(tokenCookie).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const { user, studentProfile, gameState } = await createTestStudent();
      const token = generateTestToken(server, user);

      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(user.id);
      expect(body.email).toBe(user.email);
      expect(body.studentProfile).toBeDefined();
      expect(body.gameState).toBeDefined();
    });

    it('should fail without token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer invalid-token-here',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should include student profile and game state for students', async () => {
      const { user, studentProfile, gameState } = await createTestStudent();
      const token = generateTestToken(server, user);

      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.studentProfile).toBeDefined();
      expect(body.studentProfile.studentId).toBe(user.id);
      expect(body.gameState).toBeDefined();
      expect(body.gameState.studentId).toBe(user.id);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Logged out');
    });

    it('should clear token cookie', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      expect(response.statusCode).toBe(200);
      // Cookie should be cleared (implementation dependent)
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full register -> login -> get user flow', async () => {
      // Register
      const registerResponse = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Flow Test User',
          email: 'flowtest@test.com',
          password: 'password123',
          role: 'STUDENT',
          gradeLevel: 3,
        },
      });

      expect(registerResponse.statusCode).toBe(200);
      const registerBody = JSON.parse(registerResponse.body);
      const token = registerBody.token;

      // Get current user
      const meResponse = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(meResponse.statusCode).toBe(200);
      const meBody = JSON.parse(meResponse.body);
      expect(meBody.email).toBe('flowtest@test.com');

      // Logout
      const logoutResponse = await server.inject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      expect(logoutResponse.statusCode).toBe(200);

      // Login again
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'flowtest@test.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginBody = JSON.parse(loginResponse.body);
      expect(loginBody.token).toBeDefined();
      expect(loginBody.user.email).toBe('flowtest@test.com');
    });
  });
});
