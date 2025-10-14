# Murray Creative - Build & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Environment variables configured (see `.env.example`)

### Development Build
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 📋 Build Scripts Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run build` | Full build with database checks | Local/CI builds with database |
| `npm run build:check` | Database verification + Prisma generate | Pre-build validation |
| `npm run build:production` | Production build with migrations | Deployment builds |
| `npm run health` | System health check | Deployment verification |
| `npm run db:setup` | Complete database setup | Initial deployment |

## 🔧 Build Process Details

### 1. Standard Build (`npm run build`)
```bash
npm run build:check     # Verify database + generate Prisma client
next build --turbopack  # Build Next.js application
```

**What it does:**
- ✅ Checks database connectivity
- ✅ Generates Prisma client
- ✅ Builds Next.js application
- ✅ Optimizes for production

### 2. Production Build (`npm run build:production`)
```bash
npm run db:deploy       # Apply database migrations
npm run db:generate     # Generate Prisma client
next build --turbopack  # Build Next.js application
```

**What it does:**
- ✅ Applies pending database migrations
- ✅ Generates Prisma client
- ✅ Builds Next.js application
- ✅ Production-ready output

### 3. Database Setup (`npm run db:setup`)
```bash
npm run db:deploy       # Apply migrations
npm run db:generate     # Generate Prisma client
npm run db:seed        # Seed initial data
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t murray-creative .
```

### Run with Docker Compose
```bash
# With external database
docker-compose up

# With local PostgreSQL
docker-compose --profile local-db up
```

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://user:password@host:port/db"

# Optional (for Supabase integration)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Deployment options
SEED_DATABASE="true"  # Seed database on startup
```

## 🏥 Health Checks

### Application Health
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

### System Health Check
```bash
npm run health
```

**Checks:**
- ✅ Environment variables
- ✅ Database connectivity
- ✅ Migration status

## 📊 Database Management

### Migrations
```bash
# Development (creates migration files)
npm run db:migrate

# Production (applies existing migrations)
npm run db:deploy

# Check migration status
npx prisma migrate status
```

### Database Seeding
```bash
# Seed with initial data
npm run db:seed

# Complete setup (migrate + generate + seed)
npm run db:setup
```

## 🚨 Troubleshooting

### Build Fails - Database Connection
```bash
# Check database connectivity
npm run db:check

# Verify environment
npm run health
```

### Docker Container Won't Start
```bash
# Check container logs
docker logs murray-creative

# Verify database is accessible
docker-compose logs db
```

### Migration Issues
```bash
# Reset database (development only)
npx prisma migrate reset

# Force apply migrations
npx prisma db push --force-reset
```

## 🔒 Production Checklist

- [ ] Environment variables configured
- [ ] Database accessible and running
- [ ] `npm run health` passes
- [ ] `npm run build:production` succeeds
- [ ] Health endpoint responds: `/api/health`
- [ ] Application starts without errors

## 📝 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Setup Database
  run: npm run db:setup

- name: Run Health Check
  run: npm run health

- name: Build Application
  run: npm run build:production
```

### Docker Production Startup
The Docker container automatically:
1. Waits for database connectivity
2. Applies pending migrations
3. Generates Prisma client
4. Seeds database (if `SEED_DATABASE=true`)
5. Starts Next.js application

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)