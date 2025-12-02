/**
 * API Performance Benchmarks
 * Run with: node benchmarks/api-benchmark.js
 */

import autocannon from 'autocannon';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Mock JWT token (replace with actual token for testing)
const TEST_TOKEN = process.env.TEST_TOKEN || '';

const benchmarks = [
  {
    name: 'Health Check',
    url: `${API_URL}/health`,
    connections: 10,
    duration: 10,
  },
  {
    name: 'Student Game State (Cached)',
    url: `${API_URL}/api/students/1/state`,
    headers: {
      Authorization: `Bearer ${TEST_TOKEN}`,
    },
    connections: 50,
    duration: 20,
  },
  {
    name: 'Leaderboard Query',
    url: `${API_URL}/api/game/leaderboard`,
    headers: {
      Authorization: `Bearer ${TEST_TOKEN}`,
    },
    connections: 30,
    duration: 15,
  },
  {
    name: 'Book Search',
    url: `${API_URL}/api/books/search?q=harry`,
    headers: {
      Authorization: `Bearer ${TEST_TOKEN}`,
    },
    connections: 20,
    duration: 15,
  },
];

async function runBenchmark(config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running benchmark: ${config.name}`);
  console.log(`${'='.repeat(60)}\n`);

  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url: config.url,
        connections: config.connections || 10,
        duration: config.duration || 10,
        headers: config.headers || {},
        pipelining: 1,
      },
      (err, result) => {
        if (err) {
          console.error('Benchmark error:', err);
          resolve(null);
          return;
        }

        console.log(`Results for ${config.name}:`);
        console.log(`  Requests/sec:     ${result.requests.average.toFixed(2)}`);
        console.log(`  Latency (avg):    ${result.latency.mean.toFixed(2)} ms`);
        console.log(`  Latency (p95):    ${result.latency.p95.toFixed(2)} ms`);
        console.log(`  Latency (p99):    ${result.latency.p99.toFixed(2)} ms`);
        console.log(`  Total requests:   ${result.requests.total}`);
        console.log(`  Total errors:     ${result.errors}`);
        console.log(`  Throughput:       ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);

        resolve(result);
      },
    );

    autocannon.track(instance);
  });
}

async function runAllBenchmarks() {
  console.log('Starting API Performance Benchmarks...');
  console.log(`Target: ${API_URL}\n`);

  const results = [];

  for (const benchmark of benchmarks) {
    const result = await runBenchmark(benchmark);
    if (result) {
      results.push({
        name: benchmark.name,
        requestsPerSec: result.requests.average,
        latencyAvg: result.latency.mean,
        latencyP95: result.latency.p95,
        latencyP99: result.latency.p99,
        errors: result.errors,
      });
    }
    // Wait 2 seconds between benchmarks
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  console.table(results);

  // Check if performance meets requirements
  const healthCheck = results.find((r) => r.name === 'Health Check');
  const gameState = results.find((r) => r.name === 'Student Game State (Cached)');

  console.log('\nPerformance Requirements Check:');
  console.log(`  Health Check < 50ms:        ${healthCheck?.latencyAvg < 50 ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Cached API < 100ms:         ${gameState?.latencyAvg < 100 ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  No errors:                  ${results.every((r) => r.errors === 0) ? '✓ PASS' : '✗ FAIL'}`);
}

// Run benchmarks
runAllBenchmarks().catch(console.error);
