-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', true);

-- Create storage policies for voice notes
CREATE POLICY "Voice notes are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can upload their own voice notes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own voice notes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice notes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);