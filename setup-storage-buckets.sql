-- Storage Bucket Setup SQL
-- Run this in your Supabase SQL Editor to create the required storage buckets and policies

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create voice-notes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice-notes', 'voice-notes', true, 10485760, ARRAY['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice notes" ON storage.objects;

-- Create storage policies for post-images
CREATE POLICY "Users can upload post images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all post images" ON storage.objects 
FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Users can update their own post images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for voice-notes
CREATE POLICY "Users can upload voice notes" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all voice notes" ON storage.objects 
FOR SELECT USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can update their own voice notes" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice notes" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the buckets were created
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name IN ('post-images', 'voice-notes')
ORDER BY name;
