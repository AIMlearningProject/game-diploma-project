/**
 * Unit Tests for Input Validation
 */

import { describe, it, expect } from '@jest/globals';

describe('Input Validation Unit Tests', () => {
  describe('Grade Level Validation', () => {
    function isValidGradeLevel(grade) {
      return Number.isInteger(grade) && grade >= 1 && grade <= 12;
    }

    it('should accept valid grade levels', () => {
      expect(isValidGradeLevel(1)).toBe(true);
      expect(isValidGradeLevel(6)).toBe(true);
      expect(isValidGradeLevel(12)).toBe(true);
    });

    it('should reject invalid grade levels', () => {
      expect(isValidGradeLevel(0)).toBe(false);
      expect(isValidGradeLevel(13)).toBe(false);
      expect(isValidGradeLevel(-1)).toBe(false);
      expect(isValidGradeLevel(1.5)).toBe(false);
      expect(isValidGradeLevel('5')).toBe(false);
    });
  });

  describe('Page Count Validation', () => {
    function isValidPageCount(pages) {
      return Number.isInteger(pages) && pages > 0 && pages <= 10000;
    }

    it('should accept valid page counts', () => {
      expect(isValidPageCount(1)).toBe(true);
      expect(isValidPageCount(100)).toBe(true);
      expect(isValidPageCount(500)).toBe(true);
      expect(isValidPageCount(10000)).toBe(true);
    });

    it('should reject invalid page counts', () => {
      expect(isValidPageCount(0)).toBe(false);
      expect(isValidPageCount(-10)).toBe(false);
      expect(isValidPageCount(10001)).toBe(false);
      expect(isValidPageCount(50.5)).toBe(false);
      expect(isValidPageCount('100')).toBe(false);
    });
  });

  describe('Difficulty Level Validation', () => {
    function isValidDifficulty(difficulty) {
      return typeof difficulty === 'number' && difficulty >= 0.5 && difficulty <= 2.0;
    }

    it('should accept valid difficulty levels', () => {
      expect(isValidDifficulty(0.5)).toBe(true);
      expect(isValidDifficulty(1.0)).toBe(true);
      expect(isValidDifficulty(1.5)).toBe(true);
      expect(isValidDifficulty(2.0)).toBe(true);
    });

    it('should reject invalid difficulty levels', () => {
      expect(isValidDifficulty(0.4)).toBe(false);
      expect(isValidDifficulty(2.1)).toBe(false);
      expect(isValidDifficulty(-1)).toBe(false);
      expect(isValidDifficulty('1.0')).toBe(false);
    });
  });

  describe('ISBN Validation', () => {
    function isValidISBN(isbn) {
      // Simplified ISBN validation (ISBN-10 or ISBN-13)
      const cleaned = isbn.replace(/[-\s]/g, '');
      return /^\d{10}(\d{3})?$/.test(cleaned);
    }

    it('should accept valid ISBN-10', () => {
      expect(isValidISBN('1234567890')).toBe(true);
      expect(isValidISBN('123-456-7890')).toBe(true);
    });

    it('should accept valid ISBN-13', () => {
      expect(isValidISBN('9781234567890')).toBe(true);
      expect(isValidISBN('978-1-234-56789-0')).toBe(true);
    });

    it('should reject invalid ISBNs', () => {
      expect(isValidISBN('123')).toBe(false);
      expect(isValidISBN('abc1234567890')).toBe(false);
      expect(isValidISBN('12345678901234')).toBe(false);
    });
  });

  describe('String Sanitization', () => {
    function sanitizeString(str) {
      if (typeof str !== 'string') return '';
      return str
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .substring(0, 500); // Limit length
    }

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('\ntest\n')).toBe('test');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('test<>test')).toBe('testtest');
    });

    it('should limit string length', () => {
      const longString = 'a'.repeat(1000);
      expect(sanitizeString(longString).length).toBe(500);
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(123)).toBe('');
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });
  });

  describe('Review Text Validation', () => {
    function isValidReview(review) {
      if (typeof review !== 'string') return false;
      const cleaned = review.trim();
      return cleaned.length >= 10 && cleaned.length <= 1000;
    }

    it('should accept valid reviews', () => {
      expect(isValidReview('This is a good book that I enjoyed reading.')).toBe(true);
      expect(isValidReview('Great story! ' + 'a'.repeat(100))).toBe(true);
    });

    it('should reject too short reviews', () => {
      expect(isValidReview('Good')).toBe(false);
      expect(isValidReview('   ')).toBe(false);
      expect(isValidReview('123456789')).toBe(false); // Exactly 9 chars
    });

    it('should reject too long reviews', () => {
      const longReview = 'a'.repeat(1001);
      expect(isValidReview(longReview)).toBe(false);
    });

    it('should reject non-string input', () => {
      expect(isValidReview(123)).toBe(false);
      expect(isValidReview(null)).toBe(false);
      expect(isValidReview({})).toBe(false);
    });
  });

  describe('ID Validation', () => {
    function isValidId(id) {
      return Number.isInteger(id) && id > 0;
    }

    it('should accept valid IDs', () => {
      expect(isValidId(1)).toBe(true);
      expect(isValidId(100)).toBe(true);
      expect(isValidId(999999)).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidId(0)).toBe(false);
      expect(isValidId(-1)).toBe(false);
      expect(isValidId(1.5)).toBe(false);
      expect(isValidId('1')).toBe(false);
      expect(isValidId(null)).toBe(false);
    });
  });
});
