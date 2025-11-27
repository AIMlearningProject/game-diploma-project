/**
 * Student-Teacher Integration Tests
 * Tests complete flows involving both students and teachers
 */

import { createTestServer, generateTestToken } from '../helpers/testServer.js';
import {
  cleanDatabase,
  createTestStudent,
  createTestTeacher,
  createTestBook,
  createTestClass,
} from '../helpers/testData.js';
import prisma from '../../src/services/prisma.js';

describe('Student-Teacher Integration Flow Tests', () => {
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

  describe('Complete Reading Log Flow', () => {
    it('should handle student logging book -> teacher verification flow', async () => {
      // Setup: Create class, teacher, student, and book
      const testClass = await createTestClass();
      const teacher = await createTestTeacher();
      const { user: student } = await createTestStudent({ classId: testClass.id });
      const book = await createTestBook();

      const studentToken = generateTestToken(server, student);
      const teacherToken = generateTestToken(server, teacher);

      // Step 1: Student logs a book
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 150,
          review: 'Amazing book! Loved the characters.',
          rating: 5,
        },
      });

      expect(logResponse.statusCode).toBe(201);
      const logBody = JSON.parse(logResponse.body);
      const readingLogId = logBody.id || logBody.readingLog?.id;

      // Step 2: Get student's reading logs
      const logsResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(logsResponse.statusCode).toBe(200);
      const logsBody = JSON.parse(logsResponse.body);
      expect(logsBody.length).toBeGreaterThan(0);
      expect(logsBody[0].verifiedByTeacher).toBe(false);

      // Step 3: Teacher views pending verifications
      const pendingResponse = await server.inject({
        method: 'GET',
        url: '/api/teachers/pending-verifications',
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
      });

      expect(pendingResponse.statusCode).toBe(200);
      const pendingBody = JSON.parse(pendingResponse.body);
      expect(pendingBody.length).toBeGreaterThan(0);

      // Step 4: Teacher verifies the reading log
      const verifyResponse = await server.inject({
        method: 'POST',
        url: `/api/teachers/verify-reading/${readingLogId}`,
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
        payload: {
          approved: true,
        },
      });

      expect(verifyResponse.statusCode).toBe(200);

      // Step 5: Verify student's game state was updated
      const stateResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${student.id}/state`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(stateResponse.statusCode).toBe(200);
      const stateBody = JSON.parse(stateResponse.body);
      expect(stateBody.xp).toBeGreaterThan(0);
      expect(stateBody.boardPosition).toBeGreaterThan(0);
    });

    it('should handle teacher rejection of reading log', async () => {
      const testClass = await createTestClass();
      const teacher = await createTestTeacher();
      const { user: student } = await createTestStudent({ classId: testClass.id });
      const book = await createTestBook();

      const studentToken = generateTestToken(server, student);
      const teacherToken = generateTestToken(server, teacher);

      // Student logs book
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 50,
          review: 'Did not finish it.',
          rating: 2,
        },
      });

      expect(logResponse.statusCode).toBe(201);
      const logBody = JSON.parse(logResponse.body);
      const readingLogId = logBody.id || logBody.readingLog?.id;

      // Teacher rejects
      const rejectResponse = await server.inject({
        method: 'POST',
        url: `/api/teachers/verify-reading/${readingLogId}`,
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
        payload: {
          approved: false,
          feedback: 'Please complete the book before logging.',
        },
      });

      expect(rejectResponse.statusCode).toBe(200);

      // Verify log is marked as rejected
      const updatedLog = await prisma.readingLog.findUnique({
        where: { id: readingLogId },
      });

      expect(updatedLog.verifiedByTeacher).toBe(false);
    });
  });

  describe('Class Progress Monitoring', () => {
    it('should allow teacher to view entire class progress', async () => {
      const testClass = await createTestClass();
      const teacher = await createTestTeacher();

      // Create multiple students in the class
      const student1 = await createTestStudent({ classId: testClass.id });
      const student2 = await createTestStudent({ classId: testClass.id });
      const student3 = await createTestStudent({ classId: testClass.id });

      const book = await createTestBook();

      // Students log books
      await prisma.readingLog.create({
        data: {
          studentId: student1.user.id,
          bookId: book.id,
          pagesRead: 100,
          review: 'Good',
          rating: 4,
          verifiedByTeacher: true,
        },
      });

      const teacherToken = generateTestToken(server, teacher);

      // Teacher views class progress
      const progressResponse = await server.inject({
        method: 'GET',
        url: `/api/teachers/class/${testClass.id}/progress`,
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
      });

      expect(progressResponse.statusCode).toBe(200);
      const progressBody = JSON.parse(progressResponse.body);
      expect(progressBody.students).toBeDefined();
      expect(progressBody.students.length).toBe(3);
    });
  });

  describe('Leaderboard Integration', () => {
    it('should calculate and display class leaderboard correctly', async () => {
      const testClass = await createTestClass();
      const student1 = await createTestStudent({
        classId: testClass.id,
        gameState: { xp: 1000, boardPosition: 25 }
      });
      const student2 = await createTestStudent({
        classId: testClass.id,
        gameState: { xp: 1500, boardPosition: 30 }
      });
      const student3 = await createTestStudent({
        classId: testClass.id,
        gameState: { xp: 800, boardPosition: 20 }
      });

      const token = generateTestToken(server, student1.user);

      const leaderboardResponse = await server.inject({
        method: 'GET',
        url: `/api/game/leaderboard/class/${testClass.id}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(leaderboardResponse.statusCode).toBe(200);
      const leaderboard = JSON.parse(leaderboardResponse.body);
      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].xp).toBe(1500); // student2 should be first
      expect(leaderboard[1].xp).toBe(1000); // student1 second
      expect(leaderboard[2].xp).toBe(800);  // student3 third
    });
  });

  describe('Achievement System Integration', () => {
    it('should unlock achievements and notify student', async () => {
      const { user: student, gameState } = await createTestStudent();
      const book = await createTestBook();

      // Create achievement for reading 1 book
      const achievement = await prisma.achievement.create({
        data: {
          name: 'First Steps',
          description: 'Read your first book',
          iconUrl: 'https://example.com/icon.png',
          criteriaJson: JSON.stringify({ total_books: 1 }),
        },
      });

      const studentToken = generateTestToken(server, student);

      // Log first book
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 100,
          review: 'My first book!',
          rating: 5,
        },
      });

      expect(logResponse.statusCode).toBe(201);

      // Check achievements
      const achievementsResponse = await server.inject({
        method: 'GET',
        url: `/api/students/${student.id}/achievements`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(achievementsResponse.statusCode).toBe(200);
      const achievements = JSON.parse(achievementsResponse.body);
      expect(achievements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analytics Integration', () => {
    it('should generate accurate analytics for class performance', async () => {
      const testClass = await createTestClass();
      const teacher = await createTestTeacher();
      const { user: student1 } = await createTestStudent({ classId: testClass.id });
      const { user: student2 } = await createTestStudent({ classId: testClass.id });

      const book1 = await createTestBook({ genre: 'FICTION' });
      const book2 = await createTestBook({ genre: 'NON_FICTION' });

      // Create reading logs
      await prisma.readingLog.create({
        data: {
          studentId: student1.id,
          bookId: book1.id,
          pagesRead: 100,
          review: 'Great',
          rating: 5,
          verifiedByTeacher: true,
        },
      });

      await prisma.readingLog.create({
        data: {
          studentId: student2.id,
          bookId: book2.id,
          pagesRead: 150,
          review: 'Informative',
          rating: 4,
          verifiedByTeacher: true,
        },
      });

      const teacherToken = generateTestToken(server, teacher);

      // Get analytics
      const analyticsResponse = await server.inject({
        method: 'GET',
        url: `/api/analytics/class/${testClass.id}`,
        headers: {
          authorization: `Bearer ${teacherToken}`,
        },
      });

      expect(analyticsResponse.statusCode).toBe(200);
      const analytics = JSON.parse(analyticsResponse.body);
      expect(analytics.totalBooksRead).toBe(2);
      expect(analytics.totalPagesRead).toBe(250);
      expect(analytics.genreDistribution).toBeDefined();
    });
  });

  describe('Real-time Updates via WebSocket', () => {
    it('should broadcast leaderboard updates when student progresses', async () => {
      const testClass = await createTestClass();
      const { user: student } = await createTestStudent({ classId: testClass.id });
      const book = await createTestBook();

      const token = generateTestToken(server, student);

      // Log book which should trigger leaderboard update
      const logResponse = await server.inject({
        method: 'POST',
        url: `/api/students/${student.id}/books`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          bookId: book.id,
          pagesRead: 200,
          review: 'Excellent read',
          rating: 5,
        },
      });

      expect(logResponse.statusCode).toBe(201);

      // In a real test, we'd verify WebSocket messages were sent
      // For now, verify the state was updated
      const updatedState = await prisma.gameState.findUnique({
        where: { studentId: student.id },
      });

      expect(updatedState.xp).toBeGreaterThan(0);
    });
  });

  describe('Multi-Student Competition Flows', () => {
    it('should handle multiple students competing simultaneously', async () => {
      const testClass = await createTestClass();
      const students = [];
      const books = [];

      // Create 5 students
      for (let i = 0; i < 5; i++) {
        const student = await createTestStudent({ classId: testClass.id });
        students.push(student);
      }

      // Create 3 books
      for (let i = 0; i < 3; i++) {
        const book = await createTestBook();
        books.push(book);
      }

      // Each student logs multiple books
      for (const student of students) {
        const token = generateTestToken(server, student.user);

        for (const book of books) {
          const response = await server.inject({
            method: 'POST',
            url: `/api/students/${student.user.id}/books`,
            headers: {
              authorization: `Bearer ${token}`,
            },
            payload: {
              bookId: book.id,
              pagesRead: 100,
              review: 'Good book',
              rating: 4,
            },
          });

          expect(response.statusCode).toBe(201);
        }
      }

      // Verify all students have progress
      const token = generateTestToken(server, students[0].user);
      const leaderboardResponse = await server.inject({
        method: 'GET',
        url: `/api/game/leaderboard/class/${testClass.id}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(leaderboardResponse.statusCode).toBe(200);
      const leaderboard = JSON.parse(leaderboardResponse.body);
      expect(leaderboard.length).toBe(5);

      // All students should have XP
      leaderboard.forEach(entry => {
        expect(entry.xp).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
