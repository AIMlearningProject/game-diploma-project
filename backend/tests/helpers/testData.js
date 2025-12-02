/**
 * Test Data Helpers
 * Functions to create test data in the database
 */

import bcrypt from 'bcrypt';
import prisma from '../../src/services/prisma.js';

/**
 * Clean up all test data
 */
export async function cleanDatabase() {
  // Delete in order to respect foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.readingLog.deleteMany();
  await prisma.gameState.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.classChallenge.deleteMany();
  await prisma.class.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.book.deleteMany();
  await prisma.boardConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
}

/**
 * Create a test user
 */
export async function createTestUser(overrides = {}) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  return await prisma.user.create({
    data: {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: hashedPassword,
      role: 'STUDENT',
      oauthProvider: 'LOCAL',
      ...overrides,
    },
  });
}

/**
 * Create a test student with full profile
 */
export async function createTestStudent(overrides = {}) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create class first if not provided
  let classId = overrides.classId;
  if (!classId) {
    const testClass = await prisma.class.create({
      data: {
        name: `Test Class ${Date.now()}`,
        grade: 3,
        schoolYear: '2024-2025',
      },
    });
    classId = testClass.id;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: `student-${Date.now()}@example.com`,
      password: hashedPassword,
      role: 'STUDENT',
      oauthProvider: 'LOCAL',
      ...overrides.user,
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      studentId: user.id,
      classId,
      gradeLevel: 3,
      ...overrides.profile,
    },
  });

  const gameState = await prisma.gameState.create({
    data: {
      studentId: user.id,
      boardPosition: 0,
      streak: 0,
      xp: 0,
      level: 1,
      ...overrides.gameState,
    },
  });

  return { user, studentProfile, gameState, classId };
}

/**
 * Create a test teacher
 */
export async function createTestTeacher(overrides = {}) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  return await prisma.user.create({
    data: {
      name: 'Test Teacher',
      email: `teacher-${Date.now()}@example.com`,
      password: hashedPassword,
      role: 'TEACHER',
      oauthProvider: 'LOCAL',
      ...overrides,
    },
  });
}

/**
 * Create a test admin
 */
export async function createTestAdmin(overrides = {}) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  return await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: `admin-${Date.now()}@example.com`,
      password: hashedPassword,
      role: 'ADMIN',
      oauthProvider: 'LOCAL',
      ...overrides,
    },
  });
}

/**
 * Create a test book
 */
export async function createTestBook(overrides = {}) {
  return await prisma.book.create({
    data: {
      title: `Test Book ${Date.now()}`,
      author: 'Test Author',
      isbn: `ISBN-${Date.now()}`,
      pages: 150,
      genre: 'FICTION',
      difficultyScore: 1.0,
      recommendedAgeMin: 8,
      recommendedAgeMax: 12,
      coverImage: 'https://example.com/cover.jpg',
      ...overrides,
    },
  });
}

/**
 * Create a test class
 */
export async function createTestClass(overrides = {}) {
  // Create a school first if not provided
  let schoolId = overrides.schoolId;
  if (!schoolId) {
    const school = await prisma.school.create({
      data: {
        name: `Test School ${Date.now()}`,
      },
    });
    schoolId = school.id;
  }

  // Create a teacher if not provided
  let teacherId = overrides.teacherId;
  if (!teacherId) {
    const teacher = await createTestTeacher();
    teacherId = teacher.id;
  }

  return await prisma.class.create({
    data: {
      schoolId,
      teacherId,
      name: `Test Class ${Date.now()}`,
      gradeLevel: 3,
      ...overrides,
    },
  });
}

/**
 * Create a test reading log
 */
export async function createTestReadingLog(studentId, bookId, overrides = {}) {
  return await prisma.readingLog.create({
    data: {
      studentId,
      bookId,
      pagesRead: 100,
      reviewText: 'Great book!',
      verifiedByTeacher: false,
      ...overrides,
    },
  });
}

/**
 * Create a test achievement
 */
export async function createTestAchievement(overrides = {}) {
  return await prisma.achievement.create({
    data: {
      key: `test_achievement_${Date.now()}`,
      name: `Test Achievement ${Date.now()}`,
      description: 'A test achievement',
      icon: 'https://example.com/icon.png',
      criteriaJson: JSON.stringify({ total_books: 5 }),
      ...overrides,
    },
  });
}
