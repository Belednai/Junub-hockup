-- Create comment replies table
CREATE TABLE public.comment_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  audio_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comment reactions table
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_replies
CREATE POLICY "Users can view all comment replies" ON public.comment_replies FOR SELECT USING (true);
CREATE POLICY "Users can create comment replies" ON public.comment_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comment replies" ON public.comment_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comment replies" ON public.comment_replies FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comment_reactions
CREATE POLICY "Users can view all comment reactions" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create comment reactions" ON public.comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comment reactions" ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for comment_replies updated_at
CREATE TRIGGER update_comment_replies_updated_at
  BEFORE UPDATE ON public.comment_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
