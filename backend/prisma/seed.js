import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create schools
  const school1 = await prisma.school.create({
    data: {
      name: 'Helsinki Elementary School',
      address: 'Helsinki, Finland',
    },
  });

  console.log('✓ Created schools');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lukudiplomi.fi',
      password: adminPassword,
      role: 'ADMIN',
      oauthProvider: 'LOCAL',
    },
  });

  console.log('✓ Created admin user');

  // Create teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.create({
    data: {
      name: 'Maria Teacher',
      email: 'maria.teacher@lukudiplomi.fi',
      password: teacherPassword,
      role: 'TEACHER',
      schoolId: school1.id,
      oauthProvider: 'LOCAL',
    },
  });

  console.log('✓ Created teacher');

  // Create class
  const class1 = await prisma.class.create({
    data: {
      name: 'Grade 3A',
      gradeLevel: 3,
      schoolId: school1.id,
      teacherId: teacher.id,
    },
  });

  console.log('✓ Created class');

  // Create students
  const studentPassword = await bcrypt.hash('student123', 10);

  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@lukudiplomi.fi`,
        password: studentPassword,
        role: 'STUDENT',
        schoolId: school1.id,
        oauthProvider: 'LOCAL',
        studentProfile: {
          create: {
            classId: class1.id,
            gradeLevel: 3,
            readingGoal: 10,
          },
        },
        gameState: {
          create: {
            boardPosition: 0,
            streak: 0,
            xp: 0,
            level: 1,
          },
        },
      },
    });
    students.push(student);
  }

  console.log('✓ Created students');

  // Create books
  const books = [
    {
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      isbn: '9780439708180',
      pages: 309,
      genre: 'Fantasy',
      difficultyScore: 1.8,
      recommendedAgeMin: 8,
      recommendedAgeMax: 12,
    },
    {
      title: 'The Cat in the Hat',
      author: 'Dr. Seuss',
      isbn: '9780394800011',
      pages: 61,
      genre: 'Children',
      difficultyScore: 0.5,
      recommendedAgeMin: 4,
      recommendedAgeMax: 8,
    },
    {
      title: 'Charlotte\'s Web',
      author: 'E.B. White',
      isbn: '9780064400558',
      pages: 192,
      genre: 'Fiction',
      difficultyScore: 1.2,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      pages: 310,
      genre: 'Fantasy',
      difficultyScore: 2.0,
      recommendedAgeMin: 10,
      recommendedAgeMax: 14,
    },
    {
      title: 'Diary of a Wimpy Kid',
      author: 'Jeff Kinney',
      isbn: '9780810993136',
      pages: 217,
      genre: 'Humor',
      difficultyScore: 0.8,
      recommendedAgeMin: 8,
      recommendedAgeMax: 12,
    },
    {
      title: 'Wonder',
      author: 'R.J. Palacio',
      isbn: '9780375869020',
      pages: 310,
      genre: 'Fiction',
      difficultyScore: 1.5,
      recommendedAgeMin: 8,
      recommendedAgeMax: 12,
    },
    {
      title: 'Percy Jackson: The Lightning Thief',
      author: 'Rick Riordan',
      isbn: '9780786838653',
      pages: 377,
      genre: 'Fantasy',
      difficultyScore: 1.7,
      recommendedAgeMin: 9,
      recommendedAgeMax: 13,
    },
    {
      title: 'Matilda',
      author: 'Roald Dahl',
      isbn: '9780142410370',
      pages: 240,
      genre: 'Fiction',
      difficultyScore: 1.3,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
  ];

  for (const bookData of books) {
    await prisma.book.create({ data: bookData });
  }

  console.log('✓ Created books');

  // Create achievements
  const achievements = [
    {
      key: 'first_book',
      name: 'First Steps',
      description: 'Log your first book',
      icon: '📚',
      criteriaJson: JSON.stringify({ total_books: 1 }),
      points: 10,
      tier: 'bronze',
    },
    {
      key: 'five_books',
      name: 'Bookworm',
      description: 'Read 5 books',
      icon: '🐛',
      criteriaJson: JSON.stringify({ total_books: 5 }),
      points: 25,
      tier: 'silver',
    },
    {
      key: 'ten_books',
      name: 'Reading Champion',
      description: 'Read 10 books',
      icon: '🏆',
      criteriaJson: JSON.stringify({ total_books: 10 }),
      points: 50,
      tier: 'gold',
    },
    {
      key: 'week_streak',
      name: 'Consistent Reader',
      description: 'Maintain a 7-day reading streak',
      icon: '🔥',
      criteriaJson: JSON.stringify({ streak_days: 7 }),
      points: 30,
      tier: 'silver',
    },
    {
      key: 'genre_explorer',
      name: 'Genre Explorer',
      description: 'Read books from 5 different genres',
      icon: '🌍',
      criteriaJson: JSON.stringify({ unique_genres: 5 }),
      points: 40,
      tier: 'gold',
    },
    {
      key: 'fast_reader',
      name: 'Speed Reader',
      description: 'Read 3 books in 7 days',
      icon: '⚡',
      criteriaJson: JSON.stringify({ books_in_7_days: 3 }),
      points: 35,
      tier: 'silver',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }

  console.log('✓ Created achievements');

  // Create board config
  await prisma.boardConfig.create({
    data: {
      version: '1.0',
      configJson: JSON.stringify({
        tiles: 50,
        themes: ['forest', 'ocean', 'space', 'mountain'],
      }),
      minAge: 6,
      maxAge: 18,
      isActive: true,
    },
  });

  console.log('✓ Created board configuration');

  console.log('\n=== Seeding Complete ===\n');
  console.log('Login credentials:');
  console.log('Admin:');
  console.log('  Email: admin@lukudiplomi.fi');
  console.log('  Password: admin123\n');
  console.log('Teacher:');
  console.log('  Email: maria.teacher@lukudiplomi.fi');
  console.log('  Password: teacher123\n');
  console.log('Students (1-5):');
  console.log('  Email: student[1-5]@lukudiplomi.fi');
  console.log('  Password: student123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
