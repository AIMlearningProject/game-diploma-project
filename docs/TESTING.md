# Testing Guide

## Overview

This document provides comprehensive testing instructions for the Lukudiplomi application.

## Quick Start Testing

### 1. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Adminer (database GUI) on port 8080

### 2. Install Dependencies

```bash
# Root
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Mobile (optional)
cd mobile
npm install
cd ..
```

### 3. Set Up Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed

cd ..
```

### 4. Start Development Servers

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Mobile (optional):**
```bash
cd mobile
npm start
```

## Test Accounts

After seeding, you can use these accounts:

### Admin
- Email: `admin@lukudiplomi.fi`
- Password: `admin123`
- Access: Full system access

### Teacher
- Email: `maria.teacher@lukudiplomi.fi`
- Password: `teacher123`
- Access: Class management, student monitoring

### Students (5 accounts)
- Email: `student1@lukudiplomi.fi` to `student5@lukudiplomi.fi`
- Password: `student123`
- Access: Student features, game board

## Manual Testing Checklist

### Authentication

- [ ] Login with email/password
- [ ] Logout
- [ ] Register new account
- [ ] Invalid credentials handling
- [ ] Token persistence

### Student Features

- [ ] View dashboard with stats
- [ ] View game board
- [ ] Search for books
- [ ] Log a book with review
- [ ] View reading history
- [ ] View achievements
- [ ] Check streak counter
- [ ] View leaderboard

### Teacher Features

- [ ] View class overview
- [ ] See student alerts
- [ ] Verify reading logs
- [ ] View student progress
- [ ] Create class challenge

### Game Mechanics

- [ ] Board generates correctly
- [ ] Character appears on board
- [ ] Position updates after logging book
- [ ] XP and level calculations
- [ ] Streak tracking
- [ ] Achievement unlocking

## API Testing

### Using curl

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@lukudiplomi.fi",
    "password": "student123"
  }'
```

**Get Student State (requires token):**
```bash
curl http://localhost:3000/api/students/{studentId}/state \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Database GUI

Access Adminer at http://localhost:8080

- System: PostgreSQL
- Server: postgres
- Username: lukudiplomi
- Password: lukudiplomi_dev_password
- Database: lukudiplomi

## Automated Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Performance Testing

### Load Testing with Apache Bench

Test login endpoint:
```bash
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login
```

### Monitor Performance

Watch server logs for slow queries:
```bash
cd backend
npm run dev
```

## Security Testing

### Check for vulnerabilities

```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit

# Mobile
cd mobile
npm audit
```

### Test rate limiting

```bash
for i in {1..150}; do
  curl http://localhost:3000/api/auth/login -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
done
```

You should see rate limit errors after 100 requests.

## Database Testing

### Check migrations

```bash
cd backend
npx prisma migrate status
```

### Test seed script

```bash
cd backend
npx prisma migrate reset
```

This will:
1. Drop database
2. Recreate schema
3. Run migrations
4. Seed data

## Mobile App Testing

### Test on Android Emulator

1. Start Android Studio
2. Launch Android Emulator
3. Run: `cd mobile && npm run android`

### Test on Real Device

1. Install Expo Go on your phone
2. Run: `cd mobile && npm start`
3. Scan QR code with Expo Go

## Integration Testing Scenarios

### Scenario 1: Complete Student Journey

1. Register as new student
2. Login
3. View empty dashboard
4. Search for a book
5. Log the book with review
6. Check updated stats (XP, position, streak)
7. View achievement unlock
8. Check leaderboard
9. Logout

### Scenario 2: Teacher Workflow

1. Login as teacher
2. View class overview
3. See pending reading logs
4. Verify a student's log
5. Check student alerts
6. Create a class challenge
7. View analytics

### Scenario 3: Admin Tasks

1. Login as admin
2. View all users
3. Import books via API
4. Create new achievement
5. View audit logs
6. Check system health

## Common Issues and Solutions

### Backend won't start

- Check PostgreSQL is running: `docker ps`
- Check .env file exists
- Run: `npx prisma generate`

### Frontend can't connect to API

- Verify backend is running on port 3000
- Check browser console for CORS errors
- Clear browser cache

### Database errors

- Reset database: `npx prisma migrate reset`
- Check PostgreSQL logs: `docker logs lukudiplomi-postgres`

### Redis errors

- Check Redis is running: `docker ps`
- Test connection: `redis-cli ping`

## Test Data Cleanup

To reset all test data:

```bash
cd backend
npx prisma migrate reset
```

To clean Redis cache:

```bash
redis-cli FLUSHALL
```

## Continuous Testing

Set up automated tests to run on every commit:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm test
```

## Reporting Issues

When reporting bugs, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/logs
5. Environment (OS, browser, etc.)
6. Test account used
