# Deployment Guide

## Overview

This guide covers deploying the Lukudiplomi application to production environments.

## Architecture

```
┌─────────────┐
│   Frontend  │ ──► CDN / Static Hosting
│  (React +   │
│   Phaser)   │
└─────────────┘

┌─────────────┐
│   Backend   │ ──► Node.js Server
│  (Fastify)  │
└─────────────┘
      │
      ├──► PostgreSQL Database
      └──► Redis Cache

┌─────────────┐
│   Mobile    │ ──► App Stores
│ (React      │
│  Native)    │
└─────────────┘
```

## Backend Deployment

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

1. Provision a server with:
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - Node.js 18+
   - PostgreSQL 14+
   - Redis 7+
   - Nginx

2. Clone repository:
```bash
git clone <repository-url>
cd lukudiplomi-game/backend
```

3. Install dependencies:
```bash
npm ci --production
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with production values
```

5. Run migrations:
```bash
npx prisma migrate deploy
```

6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start src/server.js --name lukudiplomi-api
pm2 startup
pm2 save
```

7. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name api.lukudiplomi.fi;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d api.lukudiplomi.fi
```

### Option 2: Docker

1. Build Docker image:
```bash
cd backend
docker build -t lukudiplomi-api .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

### Option 3: Platform as a Service (Heroku, Railway, Render)

1. Add Procfile:
```
web: node src/server.js
```

2. Configure environment variables in platform dashboard

3. Connect PostgreSQL and Redis add-ons

4. Deploy via Git push or platform CLI

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL=https://api.lukudiplomi.fi`

### Option 2: Netlify

1. Build the project:
```bash
cd frontend
npm run build
```

2. Deploy dist folder:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: Static Hosting (S3 + CloudFront, Azure Static Web Apps)

1. Build:
```bash
npm run build
```

2. Upload dist folder to hosting service

3. Configure CDN and SSL

## Mobile App Deployment

### Android (Google Play Store)

1. Create production build:
```bash
cd mobile
eas build --platform android --profile production
```

2. Download APK/AAB from Expo

3. Upload to Google Play Console

4. Complete store listing and publish

### iOS (Apple App Store)

1. Enroll in Apple Developer Program

2. Create production build:
```bash
eas build --platform ios --profile production
```

3. Download IPA from Expo

4. Upload to App Store Connect

5. Complete store listing and submit for review

## Database

### Production Database Setup

1. Use managed PostgreSQL service (AWS RDS, DigitalOcean Managed Databases)

2. Enable automated backups

3. Set up read replicas for scaling

4. Configure connection pooling

### Migrations

Run migrations in production:
```bash
npx prisma migrate deploy
```

## Monitoring & Logging

### Application Monitoring

1. Set up Sentry for error tracking:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

2. Configure log aggregation (ELK Stack, Datadog, Loggly)

### Performance Monitoring

- Set up APM (Application Performance Monitoring)
- Monitor API response times
- Track database query performance
- Monitor Redis hit rates

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure HTTP headers (Helmet configured)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database connection encryption
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement audit logging
- [ ] Use CSP (Content Security Policy)

## Scaling

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use load balancer (Nginx, AWS ALB)
3. Configure Redis for session sharing
4. Use read replicas for database

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Implement caching strategies
4. Use CDN for static assets

## Backup Strategy

1. Automated daily database backups
2. Store backups in different region
3. Test backup restoration regularly
4. Document recovery procedures

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Deploy commands here

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and deploy
        run: |
          npm run build
          # Deploy to hosting
```

## Health Checks

Implement health check endpoints:

```javascript
fastify.get('/health', async () => {
  return {
    status: 'ok',
    database: await checkDatabase(),
    redis: await checkRedis(),
    timestamp: new Date().toISOString(),
  };
});
```

## Cost Optimization

- Use auto-scaling to handle traffic spikes
- Implement caching to reduce database load
- Use CDN for static assets
- Monitor and optimize API calls
- Clean up old data regularly
