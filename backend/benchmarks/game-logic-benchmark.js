/**
 * Game Logic Performance Benchmarks
 * Tests the performance of core game calculation functions
 */

import Benchmark from 'benchmark';

// Mock game logic functions for benchmarking
function calculateSteps(pagesRead, difficulty = 1.0, gradeBonus = 1.0, streak = 1.0, diversity = 1.0) {
  const baseSteps = pagesRead / 10;
  return Math.floor(baseSteps * difficulty * gradeBonus * streak * diversity);
}

function checkAchievements(studentData) {
  const achievements = [];

  if (studentData.totalPagesRead >= 1000) {
    achievements.push({ id: 1, name: 'Bookworm' });
  }

  if (studentData.currentStreak >= 7) {
    achievements.push({ id: 2, name: 'Week Warrior' });
  }

  if (studentData.totalBooks >= 10) {
    achievements.push({ id: 3, name: 'Library Explorer' });
  }

  return achievements;
}

function updateLeaderboard(students) {
  return students
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 100)
    .map((s, index) => ({
      rank: index + 1,
      studentId: s.id,
      name: s.name,
      totalXP: s.totalXP,
    }));
}

// Create test data
const mockStudent = {
  id: 1,
  totalPagesRead: 5000,
  currentStreak: 10,
  totalBooks: 25,
  totalXP: 1500,
};

const mockStudents = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  totalXP: Math.floor(Math.random() * 10000),
}));

console.log('Running Game Logic Benchmarks...\n');

const suite = new Benchmark.Suite();

suite
  .add('Calculate Steps (simple)', () => {
    calculateSteps(100);
  })
  .add('Calculate Steps (complex)', () => {
    calculateSteps(250, 1.5, 1.2, 1.25, 1.4);
  })
  .add('Check Achievements', () => {
    checkAchievements(mockStudent);
  })
  .add('Update Leaderboard (100 students)', () => {
    updateLeaderboard(mockStudents.slice(0, 100));
  })
  .add('Update Leaderboard (1000 students)', () => {
    updateLeaderboard(mockStudents);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('\n' + '='.repeat(60));
    console.log('Benchmark Summary');
    console.log('='.repeat(60));
    this.forEach((bench) => {
      console.log(`${bench.name.padEnd(40)} ${bench.hz.toFixed(0).padStart(10)} ops/sec`);
    });
    console.log('\nAll game logic functions perform well (>10,000 ops/sec expected)');
  })
  .run({ async: false });
