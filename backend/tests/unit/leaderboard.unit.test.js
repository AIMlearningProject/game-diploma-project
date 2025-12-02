/**
 * Unit Tests for Leaderboard Logic
 */

import { describe, it, expect } from '@jest/globals';

describe('Leaderboard Unit Tests', () => {
  describe('sortStudentsByXP', () => {
    function sortStudentsByXP(students) {
      return [...students].sort((a, b) => b.totalXP - a.totalXP);
    }

    it('should sort students by XP descending', () => {
      const students = [
        { id: 1, name: 'Alice', totalXP: 500 },
        { id: 2, name: 'Bob', totalXP: 1000 },
        { id: 3, name: 'Charlie', totalXP: 750 },
      ];

      const sorted = sortStudentsByXP(students);

      expect(sorted[0].name).toBe('Bob');
      expect(sorted[1].name).toBe('Charlie');
      expect(sorted[2].name).toBe('Alice');
    });

    it('should handle equal XP values', () => {
      const students = [
        { id: 1, name: 'Alice', totalXP: 500 },
        { id: 2, name: 'Bob', totalXP: 500 },
      ];

      const sorted = sortStudentsByXP(students);

      expect(sorted[0].totalXP).toBe(500);
      expect(sorted[1].totalXP).toBe(500);
    });

    it('should handle empty array', () => {
      const sorted = sortStudentsByXP([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single student', () => {
      const students = [{ id: 1, name: 'Alice', totalXP: 500 }];
      const sorted = sortStudentsByXP(students);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].name).toBe('Alice');
    });

    it('should not mutate original array', () => {
      const students = [
        { id: 1, name: 'Alice', totalXP: 500 },
        { id: 2, name: 'Bob', totalXP: 1000 },
      ];
      const original = [...students];

      sortStudentsByXP(students);

      expect(students).toEqual(original);
    });
  });

  describe('addRankings', () => {
    function addRankings(sortedStudents) {
      return sortedStudents.map((student, index) => ({
        ...student,
        rank: index + 1,
      }));
    }

    it('should add correct rankings', () => {
      const students = [
        { id: 2, name: 'Bob', totalXP: 1000 },
        { id: 3, name: 'Charlie', totalXP: 750 },
        { id: 1, name: 'Alice', totalXP: 500 },
      ];

      const ranked = addRankings(students);

      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(3);
    });

    it('should preserve student data', () => {
      const students = [{ id: 1, name: 'Alice', totalXP: 500 }];
      const ranked = addRankings(students);

      expect(ranked[0].id).toBe(1);
      expect(ranked[0].name).toBe('Alice');
      expect(ranked[0].totalXP).toBe(500);
    });
  });

  describe('getTopN', () => {
    function getTopN(students, n) {
      return students.slice(0, n);
    }

    it('should return top N students', () => {
      const students = [
        { id: 1, rank: 1, totalXP: 1000 },
        { id: 2, rank: 2, totalXP: 900 },
        { id: 3, rank: 3, totalXP: 800 },
        { id: 4, rank: 4, totalXP: 700 },
      ];

      const top3 = getTopN(students, 3);

      expect(top3).toHaveLength(3);
      expect(top3[0].rank).toBe(1);
      expect(top3[2].rank).toBe(3);
    });

    it('should handle N greater than array length', () => {
      const students = [
        { id: 1, rank: 1, totalXP: 1000 },
        { id: 2, rank: 2, totalXP: 900 },
      ];

      const top10 = getTopN(students, 10);

      expect(top10).toHaveLength(2);
    });

    it('should handle N of 0', () => {
      const students = [{ id: 1, rank: 1, totalXP: 1000 }];
      const top0 = getTopN(students, 0);

      expect(top0).toEqual([]);
    });
  });

  describe('filterByClass', () => {
    function filterByClass(students, classId) {
      return students.filter(s => s.classId === classId);
    }

    it('should filter students by class', () => {
      const students = [
        { id: 1, name: 'Alice', classId: 1 },
        { id: 2, name: 'Bob', classId: 2 },
        { id: 3, name: 'Charlie', classId: 1 },
      ];

      const class1 = filterByClass(students, 1);

      expect(class1).toHaveLength(2);
      expect(class1.map(s => s.name)).toEqual(['Alice', 'Charlie']);
    });

    it('should return empty array if no match', () => {
      const students = [
        { id: 1, name: 'Alice', classId: 1 },
      ];

      const class2 = filterByClass(students, 2);

      expect(class2).toEqual([]);
    });
  });

  describe('calculatePercentile', () => {
    function calculatePercentile(rank, totalStudents) {
      return Math.round(((totalStudents - rank + 1) / totalStudents) * 100);
    }

    it('should calculate percentile correctly', () => {
      expect(calculatePercentile(1, 100)).toBe(100); // Top student
      expect(calculatePercentile(50, 100)).toBe(51); // Middle
      expect(calculatePercentile(100, 100)).toBe(1); // Last student
    });

    it('should handle small class sizes', () => {
      expect(calculatePercentile(1, 10)).toBe(100);
      expect(calculatePercentile(5, 10)).toBe(60);
      expect(calculatePercentile(10, 10)).toBe(10);
    });

    it('should return 100 for rank 1', () => {
      expect(calculatePercentile(1, 1)).toBe(100);
      expect(calculatePercentile(1, 5)).toBe(100);
      expect(calculatePercentile(1, 1000)).toBe(100);
    });
  });
});
