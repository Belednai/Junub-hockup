-- Create game_scores table
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_name ON game_scores(game_name);

-- Enable RLS (Row Level Security)
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own game scores" ON game_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game scores" ON game_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game scores" ON game_scores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game scores" ON game_scores
    FOR DELETE USING (auth.uid() = user_id);
