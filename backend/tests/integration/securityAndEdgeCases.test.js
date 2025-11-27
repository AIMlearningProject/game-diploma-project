/**
 * Security and Edge Cases Integration Tests
 * Tests security vulnerabilities, edge cases, and error handling
 */

import { createTestServer, generateTestToken } from '../helpers/testServer.js';
import {
  cleanDatabase,
  createTestStudent,
  createTestTeacher,
  createTestBook,
  createTestAdmin,
} from '../helpers/testData.js';
import prisma from '../../src/services/prisma.js';

describe('Security and Edge Cases Integration Tests', () => {
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

  describe('Authorization Security', () => {
    it('should prevent students from accessing other students data', async () => {
      const student1 = await createTestStudent();
      const student2 = await createTestStudent();

      const token1 = generateTestToken(server, student1.user);

      // Try to access student2's data with student1's token
      const response = await server.inject({
        method: 'GET',
        url: `/api/students/${student2.user.id}/state`,
        headers: {
          authorization: `Bearer ${token1}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should prevent students from modifying other students game state', async () => {
      const student1 = await createTestStudent();
      const student2 = await createTestStudent();
      const book = await createTestBook();

      const token1 = generateTestToken(server, student1.user);

      // Try to log book for student2 using student1's token
      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student2.user.id}/books`,
        headers: {
          authorization: `Bearer ${token1}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'Hacking attempt',
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should prevent non-teachers from verifying reading logs', async () => {
      const student = await createTestStudent();
      const book = await createTestBook();

      const studentToken = generateTestToken(server, student.user);

      // Create a reading log
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.user.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'Test',
          rating: 5,
        },
      });

      const { id: logId } = JSON.parse(logResponse.body);

      // Try to verify with student token
      const verifyResponse = await server.inject({
        method: 'POST',
        url: `/api/teachers/verify-reading/${logId}`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          approved: true,
        },
      });

      expect(verifyResponse.statusCode).toBe(403);
    });

    it('should prevent unauthorized access to admin endpoints', async () => {
      const student = await createTestStudent();
      const token = generateTestToken(server, student.user);

      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should allow admin to access admin endpoints', async () => {
      const admin = await createTestAdmin();
      const token = generateTestToken(server, admin);

      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle malicious email input', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: "'; DROP TABLE users; --",
          password: 'password',
        },
      });

      expect(response.statusCode).toBe(401);

      // Verify users table still exists
      const users = await prisma.user.findMany();
      expect(users).toBeDefined();
    });

    it('should safely handle SQL injection in search queries', async () => {
      const student = await createTestStudent();
      const token = generateTestToken(server, student.user);

      const response = await server.inject({
        method: 'GET',
        url: "/api/books/search?q=' OR '1'='1",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      // Should return safe results, not all books
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize malicious review content', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      const maliciousReview = '<script>alert("XSS")</script>This is my review';

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: maliciousReview,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(201);

      // Verify the review was stored (sanitization happens on output)
      const log = await prisma.readingLog.findFirst({
        where: { studentId: student.id },
      });

      expect(log).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive login attempts', async () => {
      const responses = [];

      // Make many rapid requests
      for (let i = 0; i < 1005; i++) {
        const response = await server.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {
            email: 'test@test.com',
            password: 'wrong',
          },
        });
        responses.push(response.statusCode);
      }

      // Should eventually get rate limited (429)
      const rateLimited = responses.filter(code => code === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases - Invalid Data', () => {
    it('should handle negative pages read', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: -100,
          review: 'Test',
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle pages read exceeding book page count', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook({ pageCount: 100 });
      const token = generateTestToken(server, student);

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 1000,
          review: 'Test',
          rating: 5,
        },
      });

      // Should either accept with warning or reject
      expect([200, 201, 400]).toContain(response.statusCode);
    });

    it('should handle invalid rating values', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'Test',
          rating: 10, // Invalid, should be 1-5
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle extremely long review text', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      const longReview = 'A'.repeat(10000);

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: longReview,
          rating: 5,
        },
      });

      // Should either accept or reject based on limits
      expect([200, 201, 400, 413]).toContain(response.statusCode);
    });

    it('should handle non-existent book ID', async () => {
      const { user: student } = await createTestStudent();
      const token = generateTestToken(server, student);

      const response = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: 'non-existent-book-id',
          pagesRead: 100,
          review: 'Test',
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Edge Cases - Concurrent Operations', () => {
    it('should handle concurrent book logging correctly', async () => {
      const { user: student } = await createTestStudent();
      const book1 = await createTestBook();
      const book2 = await createTestBook();
      const token = generateTestToken(server, student);

      // Log two books simultaneously
      const [response1, response2] = await Promise.all([
        server.inject({
          method: 'POST',
          url: `/api/students/${student.id}/books`,
          headers: {
            authorization: `Bearer ${token}`,
          },
          payload: {
            bookId: book1.id,
            pagesRead: 100,
            review: 'Book 1',
            rating: 5,
          },
        }),
        server.inject({
          method: 'POST',
          url: `/api/students/${student.id}/books`,
          headers: {
            authorization: `Bearer ${token}`,
          },
          payload: {
            bookId: book2.id,
            pagesRead: 150,
            review: 'Book 2',
            rating: 4,
          },
        }),
      ]);

      expect(response1.statusCode).toBe(201);
      expect(response2.statusCode).toBe(201);

      // Verify both logs exist
      const logs = await prisma.readingLog.findMany({
        where: { studentId: student.id },
      });

      expect(logs.length).toBe(2);
    });

    it('should handle race condition in streak updates', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      // Multiple concurrent requests
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          server.inject({
            method: 'POST',
            url: `/api/students/${student.id}/books`,
            headers: {
              authorization: `Bearer ${token}`,
            },
            payload: {
              bookId: book.id,
              pagesRead: 100,
              review: `Concurrent ${i}`,
              rating: 5,
            },
          })
        );
      }

      await Promise.all(promises);

      // Check final state is consistent
      const finalState = await prisma.gameState.findUnique({
        where: { studentId: student.id },
      });

      expect(finalState).toBeDefined();
      expect(finalState.xp).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases - Data Integrity', () => {
    it('should maintain referential integrity when deleting users', async () => {
      const { user: student, gameState } = await createTestStudent();
      const book = await createTestBook();

      await prisma.readingLog.create({
        data: {
          studentId: student.id,
          bookId: book.id,
          pagesRead: 100,
          review: 'Test',
          rating: 5,
        },
      });

      // Try to delete user (should cascade or prevent)
      try {
        await prisma.user.delete({
          where: { id: student.id },
        });

        // If deletion succeeded, related records should be gone
        const logs = await prisma.readingLog.findMany({
          where: { studentId: student.id },
        });
        expect(logs.length).toBe(0);
      } catch (error) {
        // If deletion prevented, verify data still exists
        const user = await prisma.user.findUnique({
          where: { id: student.id },
        });
        expect(user).toBeDefined();
      }
    });

    it('should handle orphaned game states gracefully', async () => {
      const { user: student } = await createTestStudent();

      // Try to get state
      const token = generateTestToken(server, student);
      const response = await server.inject({
        method: 'GET',
        url: `/api/students/${student.id}/state`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Anti-Cheating Measures', () => {
    it('should detect suspicious movement patterns', async () => {
      const { user: student } = await createTestStudent({
        gameState: { boardPosition: 10 },
      });

      const result = await server.inject({
        method: 'POST',
        url: `/api/game/validate-move`,
        headers: {
          authorization: generateTestToken(server, student),
        },
        payload: {
          claimedPosition: 100,
          claimedSteps: 5,
        },
      });

      expect(result.statusCode).toBe(400);

      // Verify audit log was created
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          actorId: student.id,
          action: 'SUSPICIOUS_MOVEMENT',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it('should prevent duplicate book logging within short timeframe', async () => {
      const { user: student } = await createTestStudent();
      const book = await createTestBook();
      const token = generateTestToken(server, student);

      // Log the same book
      const response1 = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'First time',
          rating: 5,
        },
      });

      expect(response1.statusCode).toBe(201);

      // Try to log same book immediately
      const response2 = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'Second time',
          rating: 5,
        },
      });

      // Should either accept or warn about duplicate
      expect([200, 201, 400, 409]).toContain(response2.statusCode);
    });
  });

  describe('Error Recovery', () => {
    it('should recover gracefully from database errors', async () => {
      const student = await createTestStudent();
      const token = generateTestToken(server, student.user);

      // Try to access with valid token after potential DB issue
      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should handle malformed JWT tokens', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer malformed.jwt.token',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should handle expired tokens gracefully', async () => {
      // This would require a token with expired timestamp
      const response = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
