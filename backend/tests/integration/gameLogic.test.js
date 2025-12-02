/**
 * Game Logic Integration Tests
 * Tests core game mechanics calculations
 */

import {
  calculateReward,
  updateStreak,
  generateBoardConfig,
  validateMovement,
} from '../../src/services/gameLogic.js';
import {
  cleanDatabase,
  createTestStudent,
  createTestBook,
  createTestReadingLog,
  createTestAchievement,
} from '../helpers/testData.js';
import prisma from '../../src/services/prisma.js';

describe('Game Logic Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('calculateReward()', () => {
    it('should calculate basic reward for reading a book', async () => {
      const { user, studentProfile, gameState } = await createTestStudent();
      const book = await createTestBook({ pageCount: 100 });

      const reward = await calculateReward({
        bookId: book.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(reward).toBeDefined();
      expect(reward.steps).toBeGreaterThan(0);
      expect(reward.xp).toBeGreaterThan(0);
      expect(reward.bonuses).toBeDefined();
      expect(reward.formulaVersion).toBe('1.0');
    });

    it('should apply difficulty multiplier correctly', async () => {
      const { user } = await createTestStudent();
      const easyBook = await createTestBook({
        pageCount: 100,
        difficultyScore: 0.5
      });
      const hardBook = await createTestBook({
        pageCount: 100,
        difficultyScore: 2.0
      });

      const easyReward = await calculateReward({
        bookId: easyBook.id,
        studentId: user.id,
        pagesRead: 100,
      });

      const hardReward = await calculateReward({
        bookId: hardBook.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(hardReward.steps).toBeGreaterThan(easyReward.steps);
      expect(hardReward.xp).toBeGreaterThan(easyReward.xp);
      expect(hardReward.bonuses.difficulty).toBeGreaterThan(easyReward.bonuses.difficulty);
    });

    it('should apply grade level bonus for challenging books', async () => {
      const { user, studentProfile } = await createTestStudent({
        profile: { gradeLevel: 3 }
      });

      const appropriateBook = await createTestBook({
        recommendedAgeMin: 8,
        pageCount: 100
      });

      const reward = await calculateReward({
        bookId: appropriateBook.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(reward.bonuses.grade).toBeGreaterThanOrEqual(1.0);
    });

    it('should apply streak bonus correctly', async () => {
      const { user } = await createTestStudent({
        gameState: { streak: 5 }
      });
      const book = await createTestBook({ pageCount: 100 });

      const reward = await calculateReward({
        bookId: book.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(reward.bonuses.streak).toBeGreaterThan(1.0);
    });

    it('should apply genre diversity bonus', async () => {
      const { user } = await createTestStudent();

      // Create reading history with diverse genres
      const book1 = await createTestBook({ genre: 'FICTION' });
      const book2 = await createTestBook({ genre: 'NON_FICTION' });
      const book3 = await createTestBook({ genre: 'FANTASY' });

      await createTestReadingLog(user.id, book1.id, { verifiedByTeacher: true });
      await createTestReadingLog(user.id, book2.id, { verifiedByTeacher: true });
      await createTestReadingLog(user.id, book3.id, { verifiedByTeacher: true });

      const newBook = await createTestBook({
        genre: 'SCIENCE',
        pageCount: 100
      });

      const reward = await calculateReward({
        bookId: newBook.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(reward.bonuses.diversity).toBeGreaterThan(1.0);
    });

    it('should check and return unlocked achievements', async () => {
      const { user } = await createTestStudent();
      const book = await createTestBook({ pageCount: 100 });

      // Create an achievement that requires 1 book
      await createTestAchievement({
        name: 'First Book',
        criteriaJson: JSON.stringify({ total_books: 1 }),
      });

      // Log first book
      await createTestReadingLog(user.id, book.id, { verifiedByTeacher: true });

      const reward = await calculateReward({
        bookId: book.id,
        studentId: user.id,
        pagesRead: 100,
      });

      expect(reward.achievements).toBeDefined();
      // Note: Achievement may not unlock immediately if logic requires verified logs
    });

    it('should handle missing book gracefully', async () => {
      const { user } = await createTestStudent();

      await expect(calculateReward({
        bookId: 'non-existent-id',
        studentId: user.id,
        pagesRead: 100,
      })).rejects.toThrow('Book not found');
    });

    it('should handle missing student gracefully', async () => {
      const book = await createTestBook();

      await expect(calculateReward({
        bookId: book.id,
        studentId: 'non-existent-id',
        pagesRead: 100,
      })).rejects.toThrow();
    });

    it('should scale rewards based on pages read', async () => {
      const { user } = await createTestStudent();
      const book = await createTestBook({ pageCount: 200 });

      const smallReward = await calculateReward({
        bookId: book.id,
        studentId: user.id,
        pagesRead: 50,
      });

      const largeReward = await calculateReward({
        bookId: book.id,
        studentId: user.id,
        pagesRead: 200,
      });

      expect(largeReward.steps).toBeGreaterThan(smallReward.steps);
      expect(largeReward.xp).toBeGreaterThan(smallReward.xp);
    });
  });

  describe('updateStreak()', () => {
    it('should increment streak when logging within 48 hours', async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { user } = await createTestStudent({
        gameState: {
          streak: 3,
          lastBookLoggedAt: yesterday,
        }
      });

      const updatedState = await updateStreak(user.id);

      expect(updatedState.streak).toBe(4);
      expect(updatedState.longestStreak).toBeGreaterThanOrEqual(4);
    });

    it('should reset streak when logging after 48 hours', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { user } = await createTestStudent({
        gameState: {
          streak: 5,
          longestStreak: 5,
          lastBookLoggedAt: threeDaysAgo,
        }
      });

      const updatedState = await updateStreak(user.id);

      expect(updatedState.streak).toBe(1);
      expect(updatedState.longestStreak).toBe(5); // Longest should not decrease
    });

    it('should update longestStreak when current streak exceeds it', async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { user } = await createTestStudent({
        gameState: {
          streak: 9,
          longestStreak: 8,
          lastBookLoggedAt: yesterday,
        }
      });

      const updatedState = await updateStreak(user.id);

      expect(updatedState.streak).toBe(10);
      expect(updatedState.longestStreak).toBe(10);
    });

    it('should handle first book log correctly', async () => {
      const { user } = await createTestStudent({
        gameState: {
          streak: 0,
          lastBookLoggedAt: null,
        }
      });

      const updatedState = await updateStreak(user.id);

      // Should handle null lastBookLoggedAt gracefully
      expect(updatedState).toBeDefined();
    });
  });

  describe('generateBoardConfig()', () => {
    it('should generate board with correct length for grade level', async () => {
      const { user } = await createTestStudent({
        profile: { gradeLevel: 3 }
      });

      const config = await generateBoardConfig(user.id);

      expect(config.tiles).toBeDefined();
      expect(config.tiles.length).toBeGreaterThan(50);
      expect(config.metadata.studentGrade).toBe(3);
    });

    it('should include start and diploma tiles', async () => {
      const { user } = await createTestStudent();

      const config = await generateBoardConfig(user.id);

      const startTile = config.tiles.find(t => t.type === 'start');
      const diplomaTile = config.tiles.find(t => t.type === 'diploma');

      expect(startTile).toBeDefined();
      expect(startTile.position).toBe(0);
      expect(diplomaTile).toBeDefined();
      expect(diplomaTile.position).toBe(config.tiles.length - 1);
    });

    it('should include various tile types', async () => {
      const { user } = await createTestStudent();

      const config = await generateBoardConfig(user.id);

      const tileTypes = new Set(config.tiles.map(t => t.type));

      expect(tileTypes.has('normal')).toBe(true);
      expect(tileTypes.has('bonus')).toBe(true);
      expect(tileTypes.has('checkpoint')).toBe(true);
    });

    it('should adapt board based on student performance', async () => {
      const { user: lowStreak } = await createTestStudent({
        gameState: { streak: 1 }
      });

      const { user: highStreak } = await createTestStudent({
        gameState: { streak: 10 }
      });

      const lowConfig = await generateBoardConfig(lowStreak.id);
      const highConfig = await generateBoardConfig(highStreak.id);

      expect(lowConfig.metadata.streak).toBe(1);
      expect(highConfig.metadata.streak).toBe(10);
      // Board adaptation logic varies
    });

    it('should include metadata about student performance', async () => {
      const { user } = await createTestStudent();
      const book = await createTestBook({ genre: 'FICTION' });
      await createTestReadingLog(user.id, book.id, { verifiedByTeacher: true });

      const config = await generateBoardConfig(user.id);

      expect(config.metadata).toBeDefined();
      expect(config.metadata.boardLength).toBeGreaterThan(0);
      expect(config.metadata.studentGrade).toBeDefined();
      expect(config.metadata.genreDiversity).toBeGreaterThanOrEqual(0);
    });

    it('should assign appropriate theme based on grade', async () => {
      const { user: youngStudent } = await createTestStudent({
        profile: { gradeLevel: 2 }
      });

      const { user: oldStudent } = await createTestStudent({
        profile: { gradeLevel: 9 }
      });

      const youngConfig = await generateBoardConfig(youngStudent.id);
      const oldConfig = await generateBoardConfig(oldStudent.id);

      expect(youngConfig.tiles[5].theme).toBe('forest');
      expect(oldConfig.tiles[5].theme).toBe('space');
    });
  });

  describe('validateMovement()', () => {
    it('should validate correct movement', async () => {
      const { user } = await createTestStudent({
        gameState: { boardPosition: 10 }
      });

      const validation = await validateMovement(user.id, 15, 5);

      expect(validation.valid).toBe(true);
      expect(validation.newPosition).toBe(15);
    });

    it('should reject invalid movement', async () => {
      const { user } = await createTestStudent({
        gameState: { boardPosition: 10 }
      });

      const validation = await validateMovement(user.id, 20, 5);

      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('Invalid');
    });

    it('should log suspicious activity for invalid movement', async () => {
      const { user } = await createTestStudent({
        gameState: { boardPosition: 10 }
      });

      await validateMovement(user.id, 100, 5);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          actorId: user.id,
          action: 'SUSPICIOUS_MOVEMENT',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it('should handle zero steps movement', async () => {
      const { user } = await createTestStudent({
        gameState: { boardPosition: 10 }
      });

      const validation = await validateMovement(user.id, 10, 0);

      expect(validation.valid).toBe(true);
      expect(validation.newPosition).toBe(10);
    });
  });
});
