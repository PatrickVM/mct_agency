#!/bin/bash

echo "🔍 Murray Creative Health Check"

# Check environment variables
echo "📋 Checking environment configuration..."

required_vars=("DATABASE_URL")
optional_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "NEXTAUTH_SECRET")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERROR: Required environment variable $var is not set"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

for var in "${optional_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  WARNING: Optional environment variable $var is not set"
    else
        echo "✅ $var is set"
    fi
done

# Check database connection
echo "📊 Testing database connection..."
if npx prisma db pull --force > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ ERROR: Cannot connect to database"
    echo "Please check your DATABASE_URL and ensure the database is running"
    exit 1
fi

# Check if migrations are up to date
echo "🔄 Checking migration status..."
if npx prisma migrate status > /dev/null 2>&1; then
    echo "✅ Database migrations are up to date"
else
    echo "⚠️  WARNING: Database migrations may need to be applied"
    echo "Run 'npm run db:deploy' to apply pending migrations"
fi

echo "✅ Health check completed successfully"