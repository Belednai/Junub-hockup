-- Add image support to user_posts table
ALTER TABLE public.user_posts 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Create post_images table for better image management
CREATE TABLE public.post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.user_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_images
CREATE POLICY "Users can view all post images" ON public.post_images FOR SELECT USING (true);
CREATE POLICY "Users can create post images for their own posts" ON public.post_images FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_posts 
    WHERE id = post_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own post images" ON public.post_images FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_posts 
    WHERE id = post_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their own post images" ON public.post_images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_posts 
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Storage policies for post images
CREATE POLICY "Users can upload post images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all post images" ON storage.objects FOR SELECT USING (
  bucket_id = 'post-images'
);

CREATE POLICY "Users can update their own post images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post images" ON storage.objects FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
