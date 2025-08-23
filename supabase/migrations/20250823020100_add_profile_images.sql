-- Add profile images support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_images TEXT[] DEFAULT '{}';

-- Create profile_images table for better image management
CREATE TABLE public.profile_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_images
CREATE POLICY "Users can view all profile images" ON public.profile_images FOR SELECT USING (true);
CREATE POLICY "Users can create profile images for their own profile" ON public.profile_images FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own profile images" ON public.profile_images FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their own profile images" ON public.profile_images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  )
);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage policies for profile images
CREATE POLICY "Users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile images" ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-images'
);

CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
