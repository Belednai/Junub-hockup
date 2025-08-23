-- Create user_stories table
CREATE TABLE user_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '12 hours'),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user_stories_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create story_views table to track who viewed each story
CREATE TABLE story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, viewer_id)
);

-- Create story_reactions table for likes
CREATE TABLE story_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Create story_replies table for replies to stories
CREATE TABLE story_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_stories_user_id ON user_stories(user_id);
CREATE INDEX idx_user_stories_expires_at ON user_stories(expires_at);
CREATE INDEX idx_user_stories_active ON user_stories(is_active);
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX idx_story_replies_story_id ON story_replies(story_id);

-- Enable RLS
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stories
CREATE POLICY "Users can view active stories" ON user_stories
    FOR SELECT USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Users can insert their own stories" ON user_stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON user_stories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON user_stories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for story_views
CREATE POLICY "Users can view story views" ON story_views
    FOR SELECT USING (true);

CREATE POLICY "Users can insert story views" ON story_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- RLS Policies for story_reactions
CREATE POLICY "Users can view story reactions" ON story_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own story reactions" ON story_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story reactions" ON story_reactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own story reactions" ON story_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for story_replies
CREATE POLICY "Users can view story replies" ON story_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own story replies" ON story_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story replies" ON story_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own story replies" ON story_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically deactivate expired stories
CREATE OR REPLACE FUNCTION deactivate_expired_stories()
RETURNS void AS $$
BEGIN
    UPDATE user_stories 
    SET is_active = false 
    WHERE expires_at <= NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to clean up expired stories periodically
-- This will be called whenever stories are queried
CREATE OR REPLACE FUNCTION cleanup_expired_stories_trigger()
RETURNS trigger AS $$
BEGIN
    PERFORM deactivate_expired_stories();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Storage bucket for story images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for story images
CREATE POLICY "Users can upload story images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'story-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view story images" ON storage.objects
    FOR SELECT USING (bucket_id = 'story-images');

CREATE POLICY "Users can update their own story images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'story-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own story images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'story-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
