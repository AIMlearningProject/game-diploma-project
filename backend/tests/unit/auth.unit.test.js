/**
 * Unit Tests for Authentication Logic
 */

import { describe, it, expect, jest } from '@jest/globals';
import bcrypt from 'bcrypt';

describe('Authentication Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should verify correct passwords', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2);

      // But both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('Email Validation', () => {
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('student123@school.fi')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('test domain@example.com')).toBe(false);
    });
  });

  describe('Role Validation', () => {
    function isValidRole(role) {
      const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
      return validRoles.includes(role);
    }

    it('should accept valid roles', () => {
      expect(isValidRole('STUDENT')).toBe(true);
      expect(isValidRole('TEACHER')).toBe(true);
      expect(isValidRole('ADMIN')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('USER')).toBe(false);
      expect(isValidRole('student')).toBe(false);
      expect(isValidRole('INVALID')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('Token Expiry Calculation', () => {
    function calculateTokenExpiry(expiryString) {
      // Convert '7d', '24h', '60m' to seconds
      const unit = expiryString.slice(-1);
      const value = parseInt(expiryString.slice(0, -1));

      const multipliers = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
      };

      return value * (multipliers[unit] || 0);
    }

    it('should calculate expiry in seconds correctly', () => {
      expect(calculateTokenExpiry('60s')).toBe(60);
      expect(calculateTokenExpiry('5m')).toBe(300);
      expect(calculateTokenExpiry('24h')).toBe(86400);
      expect(calculateTokenExpiry('7d')).toBe(604800);
    });

    it('should handle single digit values', () => {
      expect(calculateTokenExpiry('1d')).toBe(86400);
      expect(calculateTokenExpiry('1h')).toBe(3600);
    });
  });
});
