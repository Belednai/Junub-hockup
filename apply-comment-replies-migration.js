const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Applying comment replies and reactions migration...');

    // Create comment_replies table
    const { error: repliesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.comment_replies (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          content TEXT NOT NULL,
          audio_url TEXT,
          audio_duration INTEGER,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `
    });

    if (repliesError) {
      console.error('Error creating comment_replies table:', repliesError);
    } else {
      console.log('✓ comment_replies table created');
    }

    // Create comment_reactions table
    const { error: reactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.comment_reactions (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          reaction_type TEXT NOT NULL DEFAULT 'like',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          UNIQUE(comment_id, user_id)
        );
      `
    });

    if (reactionsError) {
      console.error('Error creating comment_reactions table:', reactionsError);
    } else {
      console.log('✓ comment_reactions table created');
    }

    // Enable RLS
    const { error: rlsError1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;'
    });

    const { error: rlsError2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError1 || rlsError2) {
      console.error('Error enabling RLS:', rlsError1 || rlsError2);
    } else {
      console.log('✓ RLS enabled');
    }

    // Create RLS policies for comment_replies
    const repliesPolicies = [
      'CREATE POLICY "Users can view all comment replies" ON public.comment_replies FOR SELECT USING (true);',
      'CREATE POLICY "Users can create comment replies" ON public.comment_replies FOR INSERT WITH CHECK (auth.uid() = user_id);',
      'CREATE POLICY "Users can update their own comment replies" ON public.comment_replies FOR UPDATE USING (auth.uid() = user_id);',
      'CREATE POLICY "Users can delete their own comment replies" ON public.comment_replies FOR DELETE USING (auth.uid() = user_id);'
    ];

    for (const policy of repliesPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating replies policy:', error);
      }
    }

    // Create RLS policies for comment_reactions
    const reactionsPolicies = [
      'CREATE POLICY "Users can view all comment reactions" ON public.comment_reactions FOR SELECT USING (true);',
      'CREATE POLICY "Users can create comment reactions" ON public.comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);',
      'CREATE POLICY "Users can delete their own comment reactions" ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);'
    ];

    for (const policy of reactionsPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating reactions policy:', error);
      }
    }

    console.log('✓ RLS policies created');
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
