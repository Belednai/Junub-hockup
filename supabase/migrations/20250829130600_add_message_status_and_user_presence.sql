-- Add message status fields to direct_messages table
ALTER TABLE direct_messages 
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create user_presence table for tracking online status
CREATE TABLE user_presence (
  user_id TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_presence
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user_presence
CREATE POLICY "Users can view all presence data" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR ALL USING (auth.uid()::text = user_id);

-- Create function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(user_id_param TEXT, is_online_param BOOLEAN DEFAULT true)
RETURNS void AS $$
BEGIN
  INSERT INTO user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (user_id_param, is_online_param, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = is_online_param,
    last_seen = CASE WHEN is_online_param THEN NOW() ELSE user_presence.last_seen END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically mark messages as delivered
CREATE OR REPLACE FUNCTION mark_messages_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all undelivered messages to this user as delivered
  UPDATE direct_messages 
  SET delivered_at = NOW(), status = 'delivered'
  WHERE receiver_id = NEW.user_id 
    AND delivered_at IS NULL 
    AND status = 'sent';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to mark messages as delivered when user comes online
CREATE TRIGGER trigger_mark_messages_delivered
  AFTER UPDATE OF is_online ON user_presence
  FOR EACH ROW
  WHEN (NEW.is_online = true AND OLD.is_online = false)
  EXECUTE FUNCTION mark_messages_delivered();

-- Update existing messages to have proper status
UPDATE direct_messages 
SET status = CASE 
  WHEN read_at IS NOT NULL THEN 'read'
  ELSE 'delivered'
END,
delivered_at = CASE 
  WHEN read_at IS NOT NULL THEN read_at
  ELSE created_at + INTERVAL '1 second'
END;
