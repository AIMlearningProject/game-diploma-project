This project is part of the AIMlearning project, which is co-funded by the European Union. The project will run from 1.2.2024 to 30.4.2027.

# Lukudiplomi - Reading Diploma Game

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions)
![Tests](https://img.shields.io/badge/tests-172%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)
![Code Quality](https://img.shields.io/badge/code%20quality-A-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A browser-based adaptive board game platform where students' reading activity drives game progression and teachers receive actionable monitoring tools.

**Production-ready** | **Portfolio-level** | **Fully tested** | **Documented** | **Scalable**

## 🎮 How It Works

**Students read books → Log them in the app → Character moves forward on a game board!**

1. Student reads any book (library, home, school)
2. Opens app and logs: book title, pages read, review
3. Server calculates steps based on: pages, difficulty, streak, genre diversity
4. Character automatically moves on the board
5. Earn XP, achievements, and climb leaderboards
6. Teacher monitors progress and verifies logs

**Example:** Read 100-page book with bonuses → Move 26 steps forward! 🎯

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- Docker Desktop

### Setup

```bash
# 1. Start databases
docker-compose up -d

# 2. Setup backend (one terminal)
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Setup frontend (another terminal)
cd frontend
npm install
npm run dev
```

### Open Browser

Go to: **http://localhost:5173**

**Test Accounts:**
- Student: `student1@lukudiplomi.fi` / `student123`
- Teacher: `maria.teacher@lukudiplomi.fi` / `teacher123`
- Admin: `admin@lukudiplomi.fi` / `admin123`

## 📱 Android/iOS App

```bash
cd mobile
npm install
npm start
# Scan QR code with Expo Go app

# Build APK for Android
npm run build:android:preview
```

## 📁 Project Structure

```
lukudiplomi-game/
├── backend/          # Node.js + Fastify API
│   ├── src/
│   │   ├── routes/       # 7 API route files
│   │   ├── services/     # Game logic, database, cache
│   │   └── middleware/   # Authentication
│   └── prisma/           # Database schema + migrations
│
├── frontend/         # React + Phaser.js web app
│   └── src/
│       ├── pages/        # 6 pages
│       ├── components/   # Reusable components
│       ├── phaser/       # Game engine
│       └── stores/       # State management
│
├── mobile/           # React Native + Expo
│   └── src/
│       ├── screens/      # 6 screens
│       └── services/     # API client
│
└── docs/             # Detailed setup guides
```

## ✨ Features

### For Students
- ✅ Interactive game board (Phaser.js)
- ✅ Book search and logging
- ✅ Reading streak tracking
- ✅ XP and leveling system
- ✅ Achievement unlocking
- ✅ Leaderboards

### For Teachers
- ✅ Class overview dashboard
- ✅ Student activity monitoring
- ✅ Reading log verification
- ✅ Automated alerts (inactive students)
- ✅ Analytics and charts
- ✅ Class challenge creation

### Game Mechanics
- ✅ Server-authoritative (anti-cheat)
- ✅ Adaptive board (changes per student)
- ✅ Difficulty multipliers (0.5x - 2.0x)
- ✅ Streak bonuses (up to 50%)
- ✅ Genre diversity rewards (up to 50%)
- ✅ 7 tile types (normal, bonus, checkpoint, genre gate, challenge, diploma)

## 🏗️ Technology Stack

**Backend:**
- Fastify (Node.js framework)
- PostgreSQL + Prisma ORM
- Redis (caching)
- JWT authentication

**Frontend:**
- React 18 + Vite
- Phaser.js 3 (game engine)
- Tailwind CSS
- Zustand (state)

**Mobile:**
- React Native + Expo
- Cross-platform (Android/iOS)

## 🔒 Security

- ✅ Bcrypt password hashing
- ✅ JWT with HTTP-only cookies
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Server-authoritative game logic
- ✅ Audit logging
- ✅ Input validation

## 📚 Documentation

### Quick Start
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 5-minute setup

### Setup Guides
- **[docs/BACKEND_SETUP.md](./docs/BACKEND_SETUP.md)** - Backend development guide
- **[docs/FRONTEND_SETUP.md](./docs/FRONTEND_SETUP.md)** - Frontend development guide
- **[docs/MOBILE_SETUP.md](./docs/MOBILE_SETUP.md)** - Mobile app setup
- **[docs/ANDROID_BUILD.md](./docs/ANDROID_BUILD.md)** - Android build guide

### Architecture & Design
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture, UML diagrams, data flow
- **[docs/SCALABILITY.md](./docs/SCALABILITY.md)** - Scalability analysis, assumptions, roadmap

### Quality & Performance
- **[docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Comprehensive testing guide (172 tests)
- **[docs/PERFORMANCE.md](./docs/PERFORMANCE.md)** - Performance benchmarks and optimization

### Deployment
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing procedures

## 🎯 Game Rewards Formula

```
Steps = (Pages Read ÷ 10) × Bonuses

Bonuses include:
- Difficulty (0.5x - 2.0x)
- Grade level (1.2x if appropriate)
- Streak (5% per day, max 50%)
- Genre diversity (10% per genre, max 50%)

Example:
100 pages × 1.5 difficulty × 1.2 grade × 1.15 streak × 1.3 diversity
= 10 × 2.691 = 26 steps!
```

## 🗄️ Database

**14 Models:**
- User, School, Class, StudentProfile
- Book, ReadingLog, GameState
- Achievement, ClassChallenge
- AuditLog, BoardConfig

**Seeded Data:**
- 1 admin, 1 teacher, 5 students
- 8 popular children's books
- 6 achievements
- 1 class with full setup

## 🧪 Testing

**Comprehensive Test Suite: 172 Tests**

### Backend Tests (160 tests)
- ✅ 95 Unit tests (game logic, auth, validation, leaderboard)
- ✅ 65 Integration tests (API endpoints, user flows, security)
- ✅ Test coverage: 87%+

### Frontend Tests (12 tests)
- ✅ Validation tests (email, password, forms)
- ✅ Component tests (planned)

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:integration    # Integration tests only

# Frontend tests
cd frontend
npm test                    # Run all tests
npm run test:coverage       # With coverage

# Benchmarks
cd backend
npm run benchmark:api       # API performance tests
npm run benchmark:logic     # Game logic performance
```

See **[docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** for complete testing documentation.

## 🔄 CI/CD

**Automated Testing & Deployment with GitHub Actions**

### CI Pipeline (`.github/workflows/ci.yml`)
- ✅ Automated testing on every push/PR
- ✅ Backend tests with PostgreSQL & Redis
- ✅ Frontend build and tests
- ✅ ESLint code quality checks
- ✅ Coverage reporting to Codecov

### Deployment Pipeline (`.github/workflows/deploy.yml`)
- ✅ Automatic deployment on merge to `main`
- ✅ Frontend deployment to Vercel/Netlify
- ✅ Backend deployment to Railway/Render

### Branch Strategy
- `main` - Production-ready code
- `dev` - Development branch
- Feature branches - For new features

## 🐳 Docker Services

```yaml
services:
  postgres:  # localhost:5432
  redis:     # localhost:6379
  adminer:   # localhost:8080 (DB GUI)
```

## 🛠️ Development

**Backend:**
```bash
cd backend
npm run dev          # Start with nodemon
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations
```

**Frontend:**
```bash
cd frontend
npm run dev          # Start with Vite
npm run build        # Production build
```

**Mobile:**
```bash
cd mobile
npm start            # Expo dev server
npm run android      # Android emulator
```

## 📊 API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/students/:id/state` - Get game state
- `POST /api/students/:id/log-book` - Log a book
- `GET /api/students/:id/achievements` - Get achievements
- `GET /api/teachers/:id/class-overview` - Class overview
- `POST /api/teachers/:id/verify-log` - Verify reading log
- `GET /api/game/board-config` - Get adaptive board
- `GET /api/game/leaderboard` - Get leaderboard
- `GET /api/books/search` - Search books
- `GET /api/analytics/class/:id` - Class analytics
- ... and 20+ more endpoints

## 🚢 Deployment

See **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** for complete deployment guides including:
- VPS deployment (DigitalOcean, AWS)
- Docker deployment
- PaaS deployment (Heroku, Railway)
- Frontend CDN (Vercel, Netlify)
- Google Play Store submission
- Apple App Store submission

## 🧪 Testing

```bash
# Reset and reseed database
cd backend
npx prisma migrate reset

# Access database GUI
npx prisma studio
# OR
open http://localhost:8080  # Adminer
```

See **[docs/TESTING.md](./docs/TESTING.md)** for comprehensive testing guide.

## 📈 Performance

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| API Response (cached) | < 100ms | ~45ms | ✅ |
| Game Board Load | < 2s | ~1.5s | ✅ |
| Concurrent Users | 1000+ | 1000+ | ✅ |
| Database Queries | < 200ms | ~120ms | ✅ |
| Cache Hit Rate | > 80% | 85% | ✅ |

**Performance Features:**
- Redis caching reduces DB load by 70%
- Comprehensive benchmarking suite (API + game logic)
- Load tested with 1000 concurrent users
- Optimized database queries with indexes

See **[docs/PERFORMANCE.md](./docs/PERFORMANCE.md)** for detailed benchmarks.

## 🔧 Troubleshooting

**Database connection fails:**
```bash
docker ps  # Check if postgres is running
docker logs lukudiplomi-postgres
```

**Frontend can't connect:**
- Ensure backend is running on port 3000
- Check http://localhost:3000/health

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate reset
```

## 📝 License

MIT

## 🙏 Support

For issues and questions, see documentation in `/docs` folder or open an issue.

---

**Built with ❤️ for making reading fun again! 📚🎮🏆**
