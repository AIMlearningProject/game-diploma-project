/**
 * Test Setup - Runs before all tests
 * Sets up test database and cleans up after tests
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.LOG_LEVEL = 'silent'; // Suppress logs during tests

// Suppress console output in tests
global.console = {
  ...console,
  log: () => {},
  info: () => {},
  debug: () => {},
  // Keep error and warn for debugging
};

beforeAll(async () => {
  // Setup runs before all tests
  console.error('🧪 Test environment initialized');
});

afterAll(async () => {
  // Cleanup runs after all tests
  console.error('✅ Test suite completed');
});
