-- Add push_token column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN push_token TEXT;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general', -- 'post', 'message', 'general'
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create unread messages count table for better performance
CREATE TABLE public.unread_message_counts (
  user_id UUID NOT NULL PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unread_message_counts ENABLE ROW LEVEL SECURITY;

-- RLS policies for unread message counts
CREATE POLICY "Users can view their own unread count" ON public.unread_message_counts FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own unread count" ON public.unread_message_counts FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "System can insert unread counts" ON public.unread_message_counts FOR INSERT WITH CHECK (true);

-- Function to update unread message count
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for receiver when new message is inserted
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.unread_message_counts (user_id, count)
    VALUES (NEW.receiver_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      count = unread_message_counts.count + 1,
      updated_at = now();
    RETURN NEW;
  END IF;
  
  -- Decrement unread count when message is marked as read
  IF TG_OP = 'UPDATE' AND OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
    UPDATE public.unread_message_counts
    SET 
      count = GREATEST(0, count - 1),
      updated_at = now()
    WHERE user_id = NEW.receiver_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unread message count
CREATE TRIGGER update_unread_message_count_trigger
  AFTER INSERT OR UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_message_count();

-- Function to create notification when new post is created
CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
DECLARE
  post_author_name TEXT;
BEGIN
  -- Get the author's name
  SELECT full_name INTO post_author_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notifications for all users except the author
  INSERT INTO public.notifications (user_id, title, body, type, data)
  SELECT 
    p.user_id,
    'New Post',
    COALESCE(post_author_name, 'Someone') || ' shared: ' || LEFT(NEW.caption, 50) || CASE WHEN LENGTH(NEW.caption) > 50 THEN '...' ELSE '' END,
    'post',
    jsonb_build_object('post_id', NEW.id, 'author_id', NEW.user_id)
  FROM public.profiles p
  WHERE p.user_id != NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new post notifications
CREATE TRIGGER notify_new_post_trigger
  AFTER INSERT ON public.user_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_post();
