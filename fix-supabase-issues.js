import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixSupabaseIssues() {
  try {
    console.log('🔧 Fixing Supabase issues...\n');

    // Test connection
    console.log('1. Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Connection successful\n');

    // Check if tables exist
    console.log('2. Checking database tables...');
    
    // Check comment_replies table
    const { data: repliesCheck, error: repliesError } = await supabase
      .from('comment_replies')
      .select('count')
      .limit(1);
    
    if (repliesError && repliesError.code === 'PGRST116') {
      console.log('❌ comment_replies table missing');
    } else {
      console.log('✅ comment_replies table exists');
    }

    // Check comment_reactions table
    const { data: reactionsCheck, error: reactionsError } = await supabase
      .from('comment_reactions')
      .select('count')
      .limit(1);
    
    if (reactionsError && reactionsError.code === 'PGRST116') {
      console.log('❌ comment_reactions table missing');
    } else {
      console.log('✅ comment_reactions table exists');
    }

    // Check storage buckets
    console.log('\n3. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError.message);
    } else {
      const postImagesBucket = buckets.find(bucket => bucket.name === 'post-images');
      const voiceNotesBucket = buckets.find(bucket => bucket.name === 'voice-notes');
      
      if (postImagesBucket) {
        console.log('✅ post-images bucket exists');
      } else {
        console.log('❌ post-images bucket missing');
      }
      
      if (voiceNotesBucket) {
        console.log('✅ voice-notes bucket exists');
      } else {
        console.log('❌ voice-notes bucket missing');
      }
    }

    console.log('\n📋 SUMMARY OF ISSUES:');
    console.log('==================');
    
    if (repliesError && repliesError.code === 'PGRST116') {
      console.log('• Missing comment_replies table - needed for comment replies functionality');
    }
    
    if (reactionsError && reactionsError.code === 'PGRST116') {
      console.log('• Missing comment_reactions table - needed for comment likes');
    }
    
    const postImagesBucket = buckets?.find(bucket => bucket.name === 'post-images');
    if (!postImagesBucket) {
      console.log('• Missing post-images storage bucket - needed for image uploads');
    }

    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('====================');
    console.log('1. Run the database migrations in your Supabase dashboard:');
    console.log('   - Go to https://supabase.com/dashboard/project/' + process.env.VITE_SUPABASE_PROJECT_ID);
    console.log('   - Navigate to SQL Editor');
    console.log('   - Run the migration files in order:');
    console.log('     * 20250821063844_add_comment_replies_and_reactions.sql');
    console.log('     * 20250822211940_add_post_images.sql');
    
    console.log('\n2. Create missing storage buckets in Supabase dashboard:');
    console.log('   - Go to Storage section');
    console.log('   - Create "post-images" bucket (public)');
    console.log('   - Create "voice-notes" bucket (public)');

    console.log('\n3. Alternative: Use Supabase CLI to apply migrations:');
    console.log('   - Install: npm install -g supabase');
    console.log('   - Login: supabase login');
    console.log('   - Link project: supabase link --project-ref ' + process.env.VITE_SUPABASE_PROJECT_ID);
    console.log('   - Apply migrations: supabase db push');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

fixSupabaseIssues();
