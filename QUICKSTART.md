# Lukudiplomi - Quick Start Guide

Get the Reading Diploma Game running in 5 minutes!

## Step 1: Start Database Services (30 seconds)

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis. Wait for them to be healthy.

## Step 2: Install Dependencies (2 minutes)

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Step 3: Set Up Database (1 minute)

```bash
cd backend
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..
```

## Step 4: Start Application (30 seconds)

Open 2 terminals:

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

## Step 5: Open Browser

Go to http://localhost:5173

## Test Login

Use any of these accounts:

**Student:**
- Email: `student1@lukudiplomi.fi`
- Password: `student123`

**Teacher:**
- Email: `maria.teacher@lukudiplomi.fi`
- Password: `teacher123`

**Admin:**
- Email: `admin@lukudiplomi.fi`
- Password: `admin123`

## What to Try

### As a Student:
1. View your dashboard
2. Click "Play Game" to see the board
3. Click "Log a Book"
4. Search for "Harry Potter"
5. Log 50 pages with a review
6. Watch your position and XP increase!

### As a Teacher:
1. View class overview
2. Check student alerts
3. Verify pending reading logs

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [docs/TESTING.md](./docs/TESTING.md) for testing guide
- See [rightplan.md](./rightplan.md) for complete architecture

## Troubleshooting

**Backend won't start?**
```bash
docker ps  # Check if postgres and redis are running
```

**Frontend can't connect?**
- Make sure backend is running on port 3000
- Check http://localhost:3000/health

**Database issues?**
```bash
cd backend
npx prisma migrate reset  # Resets and reseeds database
```

## Mobile App (Optional)

```bash
cd mobile
npm install
npm start
# Scan QR with Expo Go app
```

---

That's it! You're running the complete Lukudiplomi application.

For questions, see [docs/](./docs/) or open an issue.
