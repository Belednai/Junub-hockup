-- Create table for user friendships/connections
CREATE TABLE public.user_friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create table for direct messages between users
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships - users can see friendships they're part of
CREATE POLICY "Users can view their friendships" 
ON public.user_friendships 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests" 
ON public.user_friendships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" 
ON public.user_friendships 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for direct messages - users can see messages they sent or received
CREATE POLICY "Users can view their direct messages" 
ON public.direct_messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send direct messages" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (mark as read)" 
ON public.direct_messages 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Create indexes for better performance
CREATE INDEX idx_user_friendships_user_id ON public.user_friendships(user_id);
CREATE INDEX idx_user_friendships_friend_id ON public.user_friendships(friend_id);
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver_id ON public.direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);