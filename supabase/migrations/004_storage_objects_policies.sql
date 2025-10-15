-- Storage Objects Policies for Photos Bucket
-- Run this separately if the policies didn't apply in migration 003

-- First, check if storage.objects table exists and has RLS enabled
-- Note: storage.objects should already exist in Supabase

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all photos" ON storage.objects;

-- Public read access for gallery folder only
-- Anyone can view photos in the gallery/* path
CREATE POLICY "Public can view gallery photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = 'gallery'
  );

-- Admin-only upload policy
-- Admins can upload to any folder in the photos bucket
CREATE POLICY "Admins can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Admin-only update policy
-- Admins can update any photo in the photos bucket
CREATE POLICY "Admins can update photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Admin-only delete policy
-- Admins can delete any photo from the photos bucket
CREATE POLICY "Admins can delete photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Admin read access to all folders
-- Admins can view all photos regardless of folder
CREATE POLICY "Admins can view all photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%photos%'
ORDER BY policyname;
