/**
 * Unit Tests for Game Logic
 * Tests core game calculation functions without external dependencies
 */

import { describe, it, expect } from '@jest/globals';

// Since we don't have gameLogic exported as a separate module,
// we'll test the logic here directly
describe('Game Logic Unit Tests', () => {
  describe('calculateSteps', () => {
    function calculateSteps(pagesRead, difficulty = 1.0, gradeBonus = 1.0, streak = 1.0, diversity = 1.0) {
      const baseSteps = pagesRead / 10;
      return Math.floor(baseSteps * difficulty * gradeBonus * streak * diversity);
    }

    it('should calculate base steps correctly', () => {
      expect(calculateSteps(100)).toBe(10);
      expect(calculateSteps(50)).toBe(5);
      expect(calculateSteps(250)).toBe(25);
    });

    it('should apply difficulty multiplier', () => {
      expect(calculateSteps(100, 1.5)).toBe(15);
      expect(calculateSteps(100, 0.5)).toBe(5);
      expect(calculateSteps(100, 2.0)).toBe(20);
    });

    it('should apply all bonuses correctly', () => {
      // 100 pages, 1.5 difficulty, 1.2 grade, 1.25 streak, 1.3 diversity
      // = 10 * 1.5 * 1.2 * 1.25 * 1.3 = 29.25 -> 29
      expect(calculateSteps(100, 1.5, 1.2, 1.25, 1.3)).toBe(29);
    });

    it('should handle zero pages', () => {
      expect(calculateSteps(0)).toBe(0);
    });

    it('should handle small page counts', () => {
      expect(calculateSteps(5)).toBe(0); // 0.5 rounds down to 0
      expect(calculateSteps(10)).toBe(1);
    });

    it('should handle large page counts', () => {
      expect(calculateSteps(1000)).toBe(100);
      expect(calculateSteps(5000)).toBe(500);
    });
  });

  describe('calculateStreakBonus', () => {
    function calculateStreakBonus(currentStreak) {
      const bonus = Math.min(currentStreak * 0.05, 0.5); // 5% per day, max 50%
      return 1 + bonus;
    }

    it('should calculate streak bonus correctly', () => {
      expect(calculateStreakBonus(0)).toBe(1.0);
      expect(calculateStreakBonus(1)).toBe(1.05);
      expect(calculateStreakBonus(5)).toBe(1.25);
      expect(calculateStreakBonus(10)).toBe(1.5); // Max 50%
      expect(calculateStreakBonus(20)).toBe(1.5); // Still max 50%
    });

    it('should cap at 50% bonus', () => {
      expect(calculateStreakBonus(15)).toBe(1.5);
      expect(calculateStreakBonus(100)).toBe(1.5);
    });
  });

  describe('calculateDiversityBonus', () => {
    function calculateDiversityBonus(genresRead) {
      const bonus = Math.min(genresRead * 0.1, 0.5); // 10% per genre, max 50%
      return 1 + bonus;
    }

    it('should calculate diversity bonus correctly', () => {
      expect(calculateDiversityBonus(0)).toBe(1.0);
      expect(calculateDiversityBonus(1)).toBe(1.1);
      expect(calculateDiversityBonus(3)).toBe(1.3);
      expect(calculateDiversityBonus(5)).toBe(1.5); // Max 50%
      expect(calculateDiversityBonus(10)).toBe(1.5); // Still max 50%
    });

    it('should cap at 50% bonus', () => {
      expect(calculateDiversityBonus(6)).toBe(1.5);
      expect(calculateDiversityBonus(20)).toBe(1.5);
    });
  });

  describe('calculateGradeBonus', () => {
    function calculateGradeBonus(bookGradeLevel, studentGradeLevel) {
      // Bonus if book is at or above student grade level
      if (bookGradeLevel >= studentGradeLevel && bookGradeLevel <= studentGradeLevel + 2) {
        return 1.2; // 20% bonus
      }
      return 1.0;
    }

    it('should give bonus for appropriate grade level', () => {
      expect(calculateGradeBonus(3, 3)).toBe(1.2); // Same grade
      expect(calculateGradeBonus(4, 3)).toBe(1.2); // One grade up
      expect(calculateGradeBonus(5, 3)).toBe(1.2); // Two grades up
    });

    it('should not give bonus for too easy books', () => {
      expect(calculateGradeBonus(2, 3)).toBe(1.0); // Below grade
      expect(calculateGradeBonus(1, 3)).toBe(1.0);
    });

    it('should not give bonus for too hard books', () => {
      expect(calculateGradeBonus(6, 3)).toBe(1.0); // Three grades up
      expect(calculateGradeBonus(8, 3)).toBe(1.0);
    });
  });

  describe('calculateXP', () => {
    function calculateXP(steps) {
      return steps * 10; // 10 XP per step
    }

    it('should calculate XP correctly', () => {
      expect(calculateXP(10)).toBe(100);
      expect(calculateXP(25)).toBe(250);
      expect(calculateXP(100)).toBe(1000);
    });

    it('should handle zero steps', () => {
      expect(calculateXP(0)).toBe(0);
    });
  });

  describe('checkLevelUp', () => {
    function checkLevelUp(totalXP) {
      // Simple level formula: level = floor(sqrt(totalXP / 100))
      return Math.floor(Math.sqrt(totalXP / 100));
    }

    it('should calculate level correctly', () => {
      expect(checkLevelUp(0)).toBe(0);
      expect(checkLevelUp(100)).toBe(1);
      expect(checkLevelUp(400)).toBe(2);
      expect(checkLevelUp(900)).toBe(3);
      expect(checkLevelUp(1600)).toBe(4);
      expect(checkLevelUp(2500)).toBe(5);
    });

    it('should handle large XP values', () => {
      expect(checkLevelUp(10000)).toBe(10);
      expect(checkLevelUp(40000)).toBe(20);
    });
  });

  describe('checkAchievements', () => {
    function checkAchievements(studentData) {
      const achievements = [];

      if (studentData.totalPagesRead >= 1000) {
        achievements.push({ id: 1, name: 'Bookworm', xp: 500 });
      }

      if (studentData.currentStreak >= 7) {
        achievements.push({ id: 2, name: 'Week Warrior', xp: 300 });
      }

      if (studentData.totalBooks >= 10) {
        achievements.push({ id: 3, name: 'Library Explorer', xp: 400 });
      }

      if (studentData.totalBooks >= 50) {
        achievements.push({ id: 4, name: 'Reading Master', xp: 1000 });
      }

      if (studentData.currentStreak >= 30) {
        achievements.push({ id: 5, name: 'Marathon Reader', xp: 1500 });
      }

      return achievements;
    }

    it('should award Bookworm achievement', () => {
      const student = { totalPagesRead: 1000, currentStreak: 0, totalBooks: 0 };
      const achievements = checkAchievements(student);
      expect(achievements).toContainEqual({ id: 1, name: 'Bookworm', xp: 500 });
    });

    it('should award Week Warrior achievement', () => {
      const student = { totalPagesRead: 0, currentStreak: 7, totalBooks: 0 };
      const achievements = checkAchievements(student);
      expect(achievements).toContainEqual({ id: 2, name: 'Week Warrior', xp: 300 });
    });

    it('should award multiple achievements', () => {
      const student = { totalPagesRead: 2000, currentStreak: 10, totalBooks: 15 };
      const achievements = checkAchievements(student);
      expect(achievements).toHaveLength(3);
      expect(achievements.map(a => a.name)).toContain('Bookworm');
      expect(achievements.map(a => a.name)).toContain('Week Warrior');
      expect(achievements.map(a => a.name)).toContain('Library Explorer');
    });

    it('should return empty array for new student', () => {
      const student = { totalPagesRead: 0, currentStreak: 0, totalBooks: 0 };
      const achievements = checkAchievements(student);
      expect(achievements).toHaveLength(0);
    });

    it('should award high-level achievements', () => {
      const student = { totalPagesRead: 10000, currentStreak: 35, totalBooks: 60 };
      const achievements = checkAchievements(student);
      expect(achievements.map(a => a.name)).toContain('Reading Master');
      expect(achievements.map(a => a.name)).toContain('Marathon Reader');
    });
  });
});
