-- Create storage bucket for admin photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on admin_photos table
ALTER TABLE admin_photos ENABLE ROW LEVEL SECURITY;

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

-- Admin_photos table policies
-- Admins can manage all admin_photos records
CREATE POLICY "Admins can manage admin photos" ON admin_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Public can read gallery photos from admin_photos table
-- This allows the /gallery page to fetch metadata for public photos
CREATE POLICY "Public can read gallery photos metadata" ON admin_photos
  FOR SELECT USING (folder = 'gallery');
