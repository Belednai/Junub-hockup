-- Add post frequency tracking
CREATE TABLE public.user_post_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_date DATE NOT NULL DEFAULT CURRENT_DATE,
  post_count INTEGER NOT NULL DEFAULT 0,
  image_post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_date)
);

-- Enable RLS
ALTER TABLE public.user_post_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for post limits
CREATE POLICY "Users can view their own post limits" ON public.user_post_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own post limits" ON public.user_post_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own post limits" ON public.user_post_limits FOR UPDATE USING (auth.uid() = user_id);

-- Add trending score to posts
ALTER TABLE public.user_posts 
ADD COLUMN trending_score DECIMAL DEFAULT 0,
ADD COLUMN last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for trending posts
CREATE INDEX idx_posts_trending ON public.user_posts(trending_score DESC, created_at DESC);
CREATE INDEX idx_posts_last_interaction ON public.user_posts(last_interaction_at DESC);

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(post_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  likes_count INTEGER := 0;
  comments_count INTEGER := 0;
  shares_count INTEGER := 0;
  post_age_hours DECIMAL := 0;
  score DECIMAL := 0;
BEGIN
  -- Get interaction counts
  SELECT COUNT(*) INTO likes_count FROM public.post_reactions WHERE post_id = $1;
  SELECT COUNT(*) INTO comments_count FROM public.post_comments WHERE post_id = $1;
  SELECT COUNT(*) INTO shares_count FROM public.post_shares WHERE post_id = $1;
  
  -- Get post age in hours
  SELECT EXTRACT(EPOCH FROM (now() - created_at)) / 3600 INTO post_age_hours 
  FROM public.user_posts WHERE id = $1;
  
  -- Calculate trending score (higher is better, decays over time)
  -- Formula: (likes * 1 + comments * 2 + shares * 3) / (age_hours + 1)^0.8
  score := (likes_count * 1.0 + comments_count * 2.0 + shares_count * 3.0) / POWER(post_age_hours + 1, 0.8);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update trending scores
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.user_posts 
  SET trending_score = calculate_trending_score(id)
  WHERE created_at > now() - INTERVAL '7 days'; -- Only update posts from last 7 days
END;
$$ LANGUAGE plpgsql;

-- Function to update post limits
CREATE OR REPLACE FUNCTION update_post_limits(p_user_id UUID, has_images BOOLEAN DEFAULT FALSE)
RETURNS BOOLEAN AS $$
DECLARE
  current_limits RECORD;
  max_posts_per_day INTEGER := 10; -- General post limit
  max_image_posts_per_day INTEGER := 2; -- Image post limit
BEGIN
  -- Get or create today's limits
  INSERT INTO public.user_post_limits (user_id, post_date, post_count, image_post_count)
  VALUES (p_user_id, CURRENT_DATE, 0, 0)
  ON CONFLICT (user_id, post_date) DO NOTHING;
  
  -- Get current limits
  SELECT * INTO current_limits 
  FROM public.user_post_limits 
  WHERE user_id = p_user_id AND post_date = CURRENT_DATE;
  
  -- Check limits
  IF current_limits.post_count >= max_posts_per_day THEN
    RETURN FALSE; -- Daily post limit reached
  END IF;
  
  IF has_images AND current_limits.image_post_count >= max_image_posts_per_day THEN
    RETURN FALSE; -- Daily image post limit reached
  END IF;
  
  -- Update counters
  UPDATE public.user_post_limits 
  SET 
    post_count = post_count + 1,
    image_post_count = CASE WHEN has_images THEN image_post_count + 1 ELSE image_post_count END,
    updated_at = now()
  WHERE user_id = p_user_id AND post_date = CURRENT_DATE;
  
  RETURN TRUE; -- Post allowed
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trending score when interactions happen
CREATE OR REPLACE FUNCTION trigger_update_trending_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the post's trending score and last interaction time
  UPDATE public.user_posts 
  SET 
    trending_score = calculate_trending_score(
      CASE 
        WHEN TG_TABLE_NAME = 'post_reactions' THEN COALESCE(NEW.post_id, OLD.post_id)
        WHEN TG_TABLE_NAME = 'post_comments' THEN COALESCE(NEW.post_id, OLD.post_id)
        WHEN TG_TABLE_NAME = 'post_shares' THEN COALESCE(NEW.post_id, OLD.post_id)
      END
    ),
    last_interaction_at = now()
  WHERE id = CASE 
    WHEN TG_TABLE_NAME = 'post_reactions' THEN COALESCE(NEW.post_id, OLD.post_id)
    WHEN TG_TABLE_NAME = 'post_comments' THEN COALESCE(NEW.post_id, OLD.post_id)
    WHEN TG_TABLE_NAME = 'post_shares' THEN COALESCE(NEW.post_id, OLD.post_id)
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for trending score updates
DROP TRIGGER IF EXISTS update_trending_on_reaction ON public.post_reactions;
CREATE TRIGGER update_trending_on_reaction
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_score();

DROP TRIGGER IF EXISTS update_trending_on_comment ON public.post_comments;
CREATE TRIGGER update_trending_on_comment
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_score();

DROP TRIGGER IF EXISTS update_trending_on_share ON public.post_shares;
CREATE TRIGGER update_trending_on_share
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_score();

-- Create a scheduled job to update trending scores periodically (if pg_cron is available)
-- This would typically be set up separately in production
-- SELECT cron.schedule('update-trending-scores', '*/15 * * * *', 'SELECT update_trending_scores();');
