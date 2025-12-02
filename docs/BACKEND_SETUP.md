# Backend Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 7+

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lukudiplomi?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret
JWT_SECRET=your-super-secret-key-here

# OAuth (optional for development)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Seed the database:
```bash
npx prisma db seed
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Database Management

### Prisma Studio (GUI)
```bash
npx prisma studio
```

### Create a new migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset database
```bash
npx prisma migrate reset
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: `http://localhost:3000/documentation`

## Troubleshooting

### Database connection fails
- Ensure PostgreSQL is running: `pg_isadmin` (Linux/Mac) or check services (Windows)
- Verify DATABASE_URL in .env
- Check PostgreSQL logs

### Redis connection fails
- Ensure Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT in .env

### Port already in use
Change PORT in .env to a different port.
