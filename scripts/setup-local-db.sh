#!/bin/bash

echo "Setting up local database..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose -f docker-compose.local.yml exec mct_db_local pg_isready -U postgres -h localhost; do
  sleep 1
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
docker-compose -f docker-compose.local.yml exec murray-creative npx prisma db push

# Seed the database
echo "Seeding database..."
docker-compose -f docker-compose.local.yml exec murray-creative pnpm db:seed

echo "Local database setup complete!"
echo "Visit http://localhost:3000 to view the app"