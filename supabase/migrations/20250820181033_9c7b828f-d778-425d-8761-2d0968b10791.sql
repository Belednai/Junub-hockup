-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their friendships" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can create friendship requests" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON public.user_friendships;
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update messages they received (mark as read)" ON public.direct_messages;

-- Create new policies with proper authentication restrictions
CREATE POLICY "Users can view their friendships" 
ON public.user_friendships 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests" 
ON public.user_friendships 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" 
ON public.user_friendships 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can view their direct messages" 
ON public.direct_messages 
FOR SELECT 
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send direct messages" 
ON public.direct_messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (mark as read)" 
ON public.direct_messages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = receiver_id);