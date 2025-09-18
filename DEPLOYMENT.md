# Production Deployment Configuration

## Environment Variables Setup

For production deployment, you need to set the following environment variables in your deployment platform (Vercel, Netlify, etc.):

### Required Environment Variables

#### Database Configuration (Dual URL Setup)
```bash
# Runtime database connection (Transaction Pooler for better performance)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:BelieveTheBest34%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct database connection (for migrations and introspection)
DIRECT_URL=postgresql://postgres:BelieveTheBest34%21@db.gjiotlybrsnhumeonuhi.supabase.co:5432/postgres
```

**Important Notes:**
- Replace `[PROJECT-REF]` with your actual Supabase project reference
- The `!` in the password is URL-encoded as `%21`
- `DATABASE_URL` uses the Transaction Pooler (port 6543) with `?pgbouncer=true`
- `DIRECT_URL` uses the direct connection (port 5432) for migrations

#### Authentication & Other Variables
```bash
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STORAGE_PROVIDER=supabase
```

## How It Works

### Development
- Both `DATABASE_URL` and `DIRECT_URL` point to local PostgreSQL
- All operations use the local database

### Production
- `DATABASE_URL`: Transaction Pooler (runtime queries) - Better performance and scaling
- `DIRECT_URL`: Direct connection (migrations, introspection) - Required for schema operations

## Benefits of This Setup

1. **Better Performance**: Transaction pooler handles runtime queries efficiently
2. **Reliable Migrations**: Direct connection ensures migrations work properly
3. **Scalability**: Connection pooling prevents "too many connections" errors
4. **Compatibility**: Supports all Prisma operations in production

## Deployment Steps

1. Set all environment variables in your deployment platform
2. Deploy the application
3. The build process will:
   - Use `DIRECT_URL` for database introspection (`prisma db pull`)
   - Use `DIRECT_URL` for generating Prisma client
   - Use `DATABASE_URL` for runtime database operations

## Troubleshooting

If you encounter connection issues:

1. **Check Supabase Database Status**: Ensure your database is active in the Supabase dashboard
2. **Verify URL Encoding**: Make sure special characters in passwords are properly encoded
3. **Test Connection**: Use the Supabase SQL editor to verify database accessibility
4. **Check Environment Variables**: Ensure all variables are set correctly in your deployment platform