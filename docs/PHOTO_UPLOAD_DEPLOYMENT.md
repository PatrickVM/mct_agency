# Admin Photo Upload - Production Deployment Guide

This guide walks you through deploying the admin photo upload feature to production (Vercel + Supabase).

## Overview

The admin photo upload system uses:
- **Supabase Storage** for file storage (production)
- **Folder-based visibility** (only `gallery` folder is public)
- **Database metadata** in `admin_photos` table
- **Public gallery** at `/gallery` route

## Prerequisites

- Supabase project created and configured
- Vercel deployment set up
- Admin user account created in your app

## Step 1: Apply Supabase Migration

You need to run the `003_photos_storage_setup.sql` migration to create the photos bucket and policies.

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/003_photos_storage_setup.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option B: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd murray-creative

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

## Step 2: Verify Storage Bucket Creation

After running the migration:

1. Go to **Storage** in Supabase Dashboard
2. Verify you see a **photos** bucket
3. Click on the bucket to see it's created

### Expected Bucket Configuration:
- **Bucket Name**: `photos`
- **Public**: No (private bucket)
- **RLS Enabled**: Yes

## Step 3: Verify Row Level Security Policies

Check that the following policies were created:

### Storage Policies (storage.objects table):
1. ✅ "Public can view gallery photos" - Public SELECT for `gallery/*`
2. ✅ "Admins can upload photos" - Admin INSERT
3. ✅ "Admins can update photos" - Admin UPDATE
4. ✅ "Admins can delete photos" - Admin DELETE
5. ✅ "Admins can view all photos" - Admin SELECT (all folders)

### Database Policies (admin_photos table):
1. ✅ "Admins can manage admin photos" - Admin ALL operations
2. ✅ "Public can read gallery photos metadata" - Public SELECT where folder='gallery'

To verify policies:
1. Go to **Authentication → Policies** in Supabase Dashboard
2. Look for policies on `storage.objects` and `admin_photos` tables

## Step 4: Update Vercel Environment Variables

Ensure these environment variables are set in your Vercel project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=your-transaction-pooler-url
DIRECT_URL=your-direct-connection-url

# Storage (optional - auto-detects 'supabase' in production)
STORAGE_PROVIDER=supabase
SUPABASE_STORAGE_BUCKET=photos

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Step 5: Deploy to Vercel

```bash
# Commit the migration file
git add supabase/migrations/003_photos_storage_setup.sql
git commit -m "Add photos storage bucket migration"
git push origin main

# Vercel will auto-deploy
```

Or manually trigger deployment:
```bash
vercel --prod
```

## Step 6: Test the Photo Upload System

### Test Admin Upload:
1. Log in as an admin user
2. Go to `/admin` → Photos tab
3. Select a folder (e.g., "Gallery")
4. Upload test photos
5. Verify upload succeeds and photos appear in the list

### Test Public Gallery:
1. Upload photos to the **gallery** folder
2. Visit `/gallery` (public route, no login required)
3. Verify photos are visible
4. Test search functionality

### Test Private Folders:
1. Upload photos to **marketing**, **events**, or **misc** folders
2. Visit `/gallery` and verify they do NOT appear
3. Log in as admin and verify you can see them in `/admin` Photos tab

## Folder Visibility Rules

| Folder | Visibility | Access |
|--------|-----------|--------|
| `gallery` | Public | Everyone can view on `/gallery` page |
| `marketing` | Private | Admin-only |
| `events` | Private | Admin-only |
| `misc` | Private | Admin-only |

## Troubleshooting

### Upload fails with "Upload failed: Failed to upload file"
- **Check**: Supabase storage bucket exists
- **Check**: RLS policies are applied correctly
- **Check**: User is authenticated as admin
- **Solution**: Re-run migration 003_photos_storage_setup.sql

### Photos don't appear on /gallery page
- **Check**: Photos were uploaded to `gallery` folder (not other folders)
- **Check**: Database has entries in `admin_photos` table with `folder='gallery'`
- **Check**: Public read policy on admin_photos table exists
- **Solution**: Verify RLS policy "Public can read gallery photos metadata" exists

### Admin can't view private photos
- **Check**: User role is set to 'admin' in users table
- **Check**: Admin policies exist on storage.objects and admin_photos
- **Solution**: Run `SELECT * FROM users WHERE role='admin'` to verify admin users

### Images return 403 Forbidden
- **Check**: Storage bucket policies allow public read for gallery folder
- **Check**: Bucket is configured correctly (not fully public, but has RLS policies)
- **Solution**: Verify "Public can view gallery photos" policy on storage.objects

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Run in Supabase SQL Editor
-- Remove policies
DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage admin photos" ON admin_photos;
DROP POLICY IF EXISTS "Public can read gallery photos metadata" ON admin_photos;

-- Disable RLS (optional)
ALTER TABLE admin_photos DISABLE ROW LEVEL SECURITY;

-- Delete bucket (WARNING: This deletes all photos!)
DELETE FROM storage.buckets WHERE id = 'photos';
```

## Next Steps

After successful deployment:

1. **Create admin documentation** for uploading photos
2. **Add photo gallery link** to main navigation
3. **Consider adding metadata** like photo titles, descriptions, tags
4. **Implement image optimization** if needed (Supabase has built-in transformations)

## Architecture Notes

### How It Works:

1. **Upload Flow**:
   - Admin selects folder + files → POST `/api/upload/admin`
   - Backend validates admin auth → Uploads to Supabase Storage
   - Creates database record in `admin_photos` table
   - Returns upload results to frontend

2. **Gallery Display**:
   - Public visits `/gallery` → Fetches GET `/api/gallery/photos`
   - API queries `admin_photos` WHERE `folder='gallery'`
   - Returns only gallery photos (filtered by database)
   - Images load from Supabase Storage (public read for gallery/*)

3. **Admin View**:
   - Admin logs in → `/admin` Photos tab
   - Fetches GET `/api/admin/photos` (requires admin auth)
   - Returns ALL photos from all folders
   - Admin can delete photos via DELETE `/api/admin/photos/[id]`

### Security Model:

- **Storage bucket**: Private by default
- **RLS policies**: Control access at row level
- **Folder-based visibility**: Only `gallery/*` path is publicly readable
- **Admin verification**: All admin endpoints check `role='admin'`
- **Public endpoint**: `/api/gallery/photos` has no auth, but filters to `folder='gallery'`
