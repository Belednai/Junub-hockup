-- Function to create notification when someone likes a post
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  liker_name TEXT;
BEGIN
  -- Get the post author's ID
  SELECT user_id INTO post_author_id
  FROM public.user_posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the liker's name
  SELECT full_name INTO liker_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification for the post author
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    post_author_id,
    'New Like',
    COALESCE(liker_name, 'Someone') || ' liked your post',
    'like',
    jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when someone comments on a post
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get the post author's ID
  SELECT user_id INTO post_author_id
  FROM public.user_posts
  WHERE id = NEW.post_id;

  -- Don't notify if user comments on their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the commenter's name
  SELECT full_name INTO commenter_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification for the post author
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    post_author_id,
    'New Comment',
    COALESCE(commenter_name, 'Someone') || ' commented on your post: ' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
    'comment',
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when someone sends a friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
BEGIN
  -- Get the requester's name
  SELECT full_name INTO requester_name
  FROM public.profiles
  WHERE user_id = NEW.requester_id;

  -- Create notification for the recipient
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    NEW.recipient_id,
    'Friend Request',
    COALESCE(requester_name, 'Someone') || ' sent you a friend request',
    'friend_request',
    jsonb_build_object('requester_id', NEW.requester_id, 'request_id', NEW.id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when someone accepts a friend request
CREATE OR REPLACE FUNCTION notify_friend_request_accepted()
RETURNS TRIGGER AS $$
DECLARE
  accepter_name TEXT;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    -- Get the accepter's name
    SELECT full_name INTO accepter_name
    FROM public.profiles
    WHERE user_id = NEW.recipient_id;

    -- Create notification for the original requester
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      NEW.requester_id,
      'Friend Request Accepted',
      COALESCE(accepter_name, 'Someone') || ' accepted your friend request',
      'friend_request_accepted',
      jsonb_build_object('accepter_id', NEW.recipient_id, 'request_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when someone sends a direct message
CREATE OR REPLACE FUNCTION notify_direct_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get the sender's name
  SELECT full_name INTO sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Create notification for the receiver
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    NEW.receiver_id,
    'New Message',
    COALESCE(sender_name, 'Someone') || ': ' || LEFT(NEW.message, 50) || CASE WHEN LENGTH(NEW.message) > 50 THEN '...' ELSE '' END,
    'message',
    jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post likes
CREATE TRIGGER notify_post_like_trigger
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  WHEN (NEW.reaction_type = 'like')
  EXECUTE FUNCTION notify_post_like();

-- Create triggers for post comments
CREATE TRIGGER notify_post_comment_trigger
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();

-- Create triggers for direct messages
CREATE TRIGGER notify_direct_message_trigger
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_direct_message();

-- Check if friend_requests table exists, if not create it
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_requests
CREATE POLICY "Users can view friend requests involving them" ON public.friend_requests 
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create friend requests" ON public.friend_requests 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update friend requests" ON public.friend_requests 
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Create triggers for friend requests
CREATE TRIGGER notify_friend_request_trigger
  AFTER INSERT ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

CREATE TRIGGER notify_friend_request_accepted_trigger
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request_accepted();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on friend_requests
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
