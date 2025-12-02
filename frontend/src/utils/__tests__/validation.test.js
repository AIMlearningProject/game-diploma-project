/**
 * Frontend Validation Tests
 */

import { describe, it, expect } from 'vitest';

// Validation functions
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function validateBookTitle(title) {
  return title && title.trim().length >= 1 && title.trim().length <= 200;
}

export function validatePageCount(pages) {
  const num = Number(pages);
  return Number.isInteger(num) && num > 0 && num <= 10000;
}

describe('Frontend Validation Tests', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('student@school.fi')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('12345678')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('1234567')).toBe(false);
    });

    it('should reject empty passwords', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  describe('validateBookTitle', () => {
    it('should accept valid titles', () => {
      expect(validateBookTitle('Harry Potter')).toBe(true);
      expect(validateBookTitle('A')).toBe(true);
    });

    it('should reject empty titles', () => {
      expect(validateBookTitle('')).toBe(false);
      expect(validateBookTitle('   ')).toBe(false);
    });

    it('should reject too long titles', () => {
      expect(validateBookTitle('a'.repeat(201))).toBe(false);
    });
  });

  describe('validatePageCount', () => {
    it('should accept valid page counts', () => {
      expect(validatePageCount(100)).toBe(true);
      expect(validatePageCount('100')).toBe(true);
    });

    it('should reject invalid page counts', () => {
      expect(validatePageCount(0)).toBe(false);
      expect(validatePageCount(-10)).toBe(false);
      expect(validatePageCount(10001)).toBe(false);
      expect(validatePageCount('abc')).toBe(false);
    });
  });
});
