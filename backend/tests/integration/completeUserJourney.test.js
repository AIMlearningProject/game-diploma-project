/**
 * Complete User Journey Integration Tests
 * Tests end-to-end user workflows from registration to diploma
 */

import { createTestServer, generateTestToken } from '../helpers/testServer.js';
import {
  cleanDatabase,
  createTestClass,
  createTestBook,
} from '../helpers/testData.js';
import prisma from '../../src/services/prisma.js';

describe('Complete User Journey Integration Tests', () => {
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

  describe('Student Complete Journey: Registration to First Book', () => {
    it('should complete full student onboarding and first book flow', async () => {
      // Create prerequisite data
      const testClass = await createTestClass();
      const book = await createTestBook();

      // Step 1: Student registers
      const registerResponse = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Alice Student',
          email: 'alice@test.com',
          password: 'secure123',
          role: 'STUDENT',
          classId: testClass.id,
          gradeLevel: 3,
        },
      });

      expect(registerResponse.statusCode).toBe(200);
      const { user, token } = JSON.parse(registerResponse.body);
      expect(user.role).toBe('STUDENT');
      expect(token).toBeDefined();

      // Step 2: Get initial state
      const meResponse = await server.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(meResponse.statusCode).toBe(200);
      const userData = JSON.parse(meResponse.body);
      expect(userData.studentProfile).toBeDefined();
      expect(userData.gameState).toBeDefined();
      expect(userData.gameState.boardPosition).toBe(0);
      expect(userData.gameState.xp).toBe(0);

      // Step 3: Get game board
      const boardResponse = await server.inject({
        method: 'GET',
        url: `/api/game/board/${user.id}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(boardResponse.statusCode).toBe(200);
      const board = JSON.parse(boardResponse.body);
      expect(board.tiles).toBeDefined();
      expect(board.tiles.length).toBeGreaterThan(0);

      // Step 4: Search for books
      const searchResponse = await server.inject({
        method: 'GET',
        url: '/api/books/search?q=Test',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(searchResponse.statusCode).toBe(200);
      const searchResults = JSON.parse(searchResponse.body);
      expect(searchResults.length).toBeGreaterThan(0);

      // Step 5: Log first book
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${user.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 150,
          review: 'This is my first book! I loved the adventure and the characters were amazing.',
          rating: 5,
        },
      });

      expect(logResponse.statusCode).toBe(201);
      const logData = JSON.parse(logResponse.body);
      expect(logData).toBeDefined();

      // Step 6: Check updated state
      const updatedStateResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/state`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(updatedStateResponse.statusCode).toBe(200);
      const updatedState = JSON.parse(updatedStateResponse.body);
      expect(updatedState.xp).toBeGreaterThan(0);
      expect(updatedState.boardPosition).toBeGreaterThan(0);

      // Step 7: Check reading history
      const historyResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(historyResponse.statusCode).toBe(200);
      const history = JSON.parse(historyResponse.body);
      expect(history.length).toBe(1);
      expect(history[0].book.title).toBe(book.title);

      // Step 8: Check profile statistics
      const statsResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/stats`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(statsResponse.statusCode).toBe(200);
      const stats = JSON.parse(statsResponse.body);
      expect(stats.totalBooksRead).toBe(1);
      expect(stats.totalPagesRead).toBe(150);
    });
  });

  describe('Student Progress Journey: Multiple Books to Level Up', () => {
    it('should track student progression through multiple books', async () => {
      const testClass = await createTestClass();
      const books = [];

      // Create multiple books
      for (let i = 1; i <= 5; i++) {
        books.push(await createTestBook({
          title: `Book ${i}`,
          genre: i % 2 === 0 ? 'FICTION' : 'NON_FICTION',
          pageCount: 100 + (i * 20),
        }));
      }

      // Register student
      const registerResponse = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Bob Reader',
          email: 'bob@test.com',
          password: 'secure123',
          role: 'STUDENT',
          classId: testClass.id,
          gradeLevel: 4,
        },
      });

      const { user, token } = JSON.parse(registerResponse.body);

      let previousXP = 0;
      let previousPosition = 0;

      // Log each book and verify progression
      for (let i = 0; i < books.length; i++) {
        const book = books[i];

        const logResponse = await server.inject({
          method: 'POST',
          url: `/api/students/${user.id}/books`,
          headers: {
            authorization: `Bearer ${token}`,
          },
          payload: {
            bookId: book.id,
            pagesRead: book.pageCount,
            review: `Review for book ${i + 1}`,
            rating: 4 + (i % 2),
          },
        });

        expect(logResponse.statusCode).toBe(201);

        // Check state after each book
        const stateResponse = await server.inject({
          method: 'GET',
          url: `/api/students/${user.id}/state`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const state = JSON.parse(stateResponse.body);

        // XP should increase
        expect(state.xp).toBeGreaterThan(previousXP);
        previousXP = state.xp;

        // Position should advance
        expect(state.boardPosition).toBeGreaterThanOrEqual(previousPosition);
        previousPosition = state.boardPosition;

        // Level might increase
        expect(state.level).toBeGreaterThanOrEqual(1);

        // Wait a bit to ensure timestamps are different
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Final stats check
      const finalStatsResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/stats`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const finalStats = JSON.parse(finalStatsResponse.body);
      expect(finalStats.totalBooksRead).toBe(5);
      expect(finalStats.totalPagesRead).toBeGreaterThan(500);
    });
  });

  describe('Teacher Journey: Class Management', () => {
    it('should complete teacher workflow from login to verification', async () => {
      const testClass = await createTestClass();

      // Register teacher
      const teacherRegister = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Ms. Johnson',
          email: 'johnson@test.com',
          password: 'teacher123',
          role: 'TEACHER',
        },
      });

      expect(teacherRegister.statusCode).toBe(200);
      const { user: teacher, token: teacherToken } = JSON.parse(teacherRegister.body);

      // Register student in class
      const studentRegister = await server.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Charlie Student',
          email: 'charlie@test.com',
          password: 'student123',
          role: 'STUDENT',
          classId: testClass.id,
          gradeLevel: 3,
        },
      });

      const { user: student, token: studentToken } = JSON.parse(studentRegister.body);

      // Student logs a book
      const book = await createTestBook();
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 200,
          review: 'Amazing book!',
          rating: 5,
        },
      });

      expect(logResponse.statusCode).toBe(201);
      const { id: readingLogId } = JSON.parse(logResponse.body);

      // Teacher views dashboard
      const dashboardResponse = await server.inject({
        method: 'GET',
        url: '/api/teachers/dashboard',
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
      });

      expect(dashboardResponse.statusCode).toBe(200);

      // Teacher views pending verifications
      const pendingResponse = await server.inject({
        method: 'GET',
        url: '/api/teachers/pending-verifications',
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
      });

      expect(pendingResponse.statusCode).toBe(200);
      const pending = JSON.parse(pendingResponse.body);
      expect(pending.length).toBeGreaterThan(0);

      // Teacher verifies the log
      const verifyResponse = await server.inject({
        method: 'POST',
        url: `/api/teachers/verify-reading/${readingLogId}`,
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
        payload: {
          approved: true,
          feedback: 'Great work!',
        },
      });

      expect(verifyResponse.statusCode).toBe(200);

      // Check student state was updated
      const updatedState = await prisma.gameState.findUnique({
        where: { studentId: student.id },
      });

      expect(updatedState.xp).toBeGreaterThan(0);
    });
  });

  describe('Cross-System Data Consistency', () => {
    it('should maintain data consistency across all systems', async () => {
      const testClass = await createTestClass();
      const book = await createTestBook({ pageCount: 150 });

      // Create student
      const { user, token } = JSON.parse(
        (await server.inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            name: 'Test Student',
            email: 'consistency@test.com',
            password: 'test123',
            role: 'STUDENT',
            classId: testClass.id,
            gradeLevel: 3,
          },
        })).body
      );

      // Log book
      await server.inject({
        method: 'POST',
        url: `/api/students/${user.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 150,
          review: 'Test review',
          rating: 5,
        },
      });

      // Check consistency across different endpoints
      const stateResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/state`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const statsResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/stats`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const historyResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${user.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const state = JSON.parse(stateResponse.body);
      const stats = JSON.parse(statsResponse.body);
      const history = JSON.parse(historyResponse.body);

      // All should reflect the same data
      expect(stats.totalBooksRead).toBe(1);
      expect(stats.totalPagesRead).toBe(150);
      expect(history.length).toBe(1);
      expect(history[0].pagesRead).toBe(150);
      expect(state.xp).toBeGreaterThan(0);
    });
  });
});
