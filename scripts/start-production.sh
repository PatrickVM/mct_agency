#!/bin/bash

echo "🚀 Starting Murray Creative (Production)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Checking database connection..."

# Wait for database to be accessible (with timeout)
timeout=60
counter=0

while ! npx prisma db pull --force > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ ERROR: Database connection timeout after ${timeout} seconds"
        echo "Please ensure your database is running and DATABASE_URL is correct"
        exit 1
    fi

    echo "⏳ Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ Database connection established"

# Run database migrations
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ ERROR: Database migrations failed"
    exit 1
fi

# Generate Prisma client (in case of version mismatches)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database needs seeding (optional - only if no users exist)
echo "🌱 Checking if database needs initial seeding..."
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed || echo "⚠️  Warning: Database seeding failed (may already be seeded)"
fi

echo "🚀 Starting Next.js application..."
exec node server.js