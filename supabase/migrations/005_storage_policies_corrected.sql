-- CORRECTED Storage Objects Policies for Photos Bucket
-- Based on official Supabase documentation

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all photos" ON storage.objects;

-- Policy 1: Public read access for gallery folder only
-- Anyone (including anonymous users) can view photos in the gallery/* path
CREATE POLICY "Public can view gallery photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = 'gallery'
);

-- Policy 2: Authenticated admin users can upload to any folder
-- Only authenticated users with admin role can insert files
CREATE POLICY "Admins can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text
    AND role = 'admin'
  )
);

-- Policy 3: Authenticated admin users can update any photo
CREATE POLICY "Admins can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text
    AND role = 'admin'
  )
);

-- Policy 4: Authenticated admin users can delete any photo
CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text
    AND role = 'admin'
  )
);

-- Policy 5: Authenticated admin users can view all photos (all folders)
CREATE POLICY "Admins can view all photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text
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
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
