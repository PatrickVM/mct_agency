# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication → Settings**
2. Under **Site URL**, set: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## 3. Configure Email Settings

1. Go to **Authentication → Settings → SMTP Settings**
2. Enable custom SMTP or use Supabase's built-in email service
3. For development, you can use services like:
   - Mailgun
   - SendGrid
   - Gmail SMTP

## 4. Get API Credentials

1. Go to **Settings → API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API Keys → service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 5. Update Environment Variables

Update your `.env.local` file:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (get from Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Next.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 6. Run Database Migrations

Apply the Supabase migrations to set up RLS policies and storage buckets:

```bash
# Navigate to your project directory
cd murray-creative

# Apply all migrations (or use Supabase CLI)
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manually run migrations in Supabase SQL Editor
# - Go to Supabase Dashboard → SQL Editor
# - Copy and paste each migration file from supabase/migrations/
# - Run in order: 001, 002, 003
```

### Migrations Overview:
- `001_initial_schema.sql` - RLS policies for users, profiles, notes, invite_tokens
- `002_storage_setup.sql` - Avatars storage bucket and policies
- `003_photos_storage_setup.sql` - Photos storage bucket and policies (for admin photo uploads)

## 7. Verify Storage Buckets

After running migrations, verify the storage buckets were created:

1. Go to **Storage** in Supabase Dashboard
2. You should see two buckets:
   - **avatars** - For user profile avatars
   - **photos** - For admin-uploaded photos (gallery, marketing, events, misc)

### Photos Bucket Folder Structure:
- `gallery/` - Public photos (visible on /gallery page)
- `marketing/` - Private marketing materials (admin-only)
- `events/` - Private event photos (admin-only)
- `misc/` - Private miscellaneous photos (admin-only)

## 8. Test the Setup

1. Restart your development server
2. Go to `/admin` and create an invite
3. The magic link should now work properly
4. Test admin photo upload:
   - Go to `/admin` → Photos tab
   - Upload photos to different folders
   - Verify gallery folder photos appear on `/gallery` page

## Troubleshooting

- **"Invalid API key" error**: Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- **Magic link not working**: Verify redirect URLs in Supabase dashboard
- **Email not sending**: Check SMTP configuration in Supabase dashboard
- **Photo upload fails**: Verify `photos` storage bucket exists and RLS policies are applied
- **Gallery photos not visible**: Check that photos are uploaded to `gallery` folder