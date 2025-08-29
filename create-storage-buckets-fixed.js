import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createStorageBucketsFixed() {
  try {
    console.log('🪣 Creating storage buckets using SQL approach...\n');

    // First, let's check if buckets already exist
    console.log('🔍 Checking existing buckets...');
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('⚠️  Cannot list buckets (this is expected with anon key)');
    } else {
      const postImagesBucket = existingBuckets.find(bucket => bucket.name === 'post-images');
      const voiceNotesBucket = existingBuckets.find(bucket => bucket.name === 'voice-notes');
      
      if (postImagesBucket && voiceNotesBucket) {
        console.log('✅ Both buckets already exist!');
        return;
      }
    }

    // Try to create buckets using SQL
    console.log('🔧 Creating buckets using SQL...');
    
    const createBucketsSQL = `
      -- Create post-images bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
      ON CONFLICT (id) DO NOTHING;

      -- Create voice-notes bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('voice-notes', 'voice-notes', true, 10485760, ARRAY['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'])
      ON CONFLICT (id) DO NOTHING;

      -- Create storage policies for post-images
      CREATE POLICY IF NOT EXISTS "Users can upload post images" ON storage.objects 
      FOR INSERT WITH CHECK (
        bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY IF NOT EXISTS "Users can view all post images" ON storage.objects 
      FOR SELECT USING (bucket_id = 'post-images');

      CREATE POLICY IF NOT EXISTS "Users can update their own post images" ON storage.objects 
      FOR UPDATE USING (
        bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY IF NOT EXISTS "Users can delete their own post images" ON storage.objects 
      FOR DELETE USING (
        bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
      );

      -- Create storage policies for voice-notes
      CREATE POLICY IF NOT EXISTS "Users can upload voice notes" ON storage.objects 
      FOR INSERT WITH CHECK (
        bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY IF NOT EXISTS "Users can view all voice notes" ON storage.objects 
      FOR SELECT USING (bucket_id = 'voice-notes');

      CREATE POLICY IF NOT EXISTS "Users can update their own voice notes" ON storage.objects 
      FOR UPDATE USING (
        bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY IF NOT EXISTS "Users can delete their own voice notes" ON storage.objects 
      FOR DELETE USING (
        bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createBucketsSQL });
    
    if (error) {
      console.error('❌ SQL execution failed:', error.message);
      console.log('\n📋 Manual Setup Required:');
      console.log('Since automatic setup failed, please follow these steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop');
      console.log('2. Navigate to Storage → Buckets');
      console.log('3. Create two buckets:');
      console.log('   - Name: post-images, Public: Yes, File size limit: 5MB');
      console.log('   - Name: voice-notes, Public: Yes, File size limit: 10MB');
      console.log('4. Go to Storage → Policies and apply the policies from the migration file');
      return;
    }

    console.log('✅ SQL executed successfully');

    // Verify the buckets were created
    console.log('\n🔍 Verifying bucket creation...');
    const { data: buckets, error: verifyError } = await supabase.storage.listBuckets();
    
    if (verifyError) {
      console.log('⚠️  Cannot verify buckets (this is expected with anon key)');
      console.log('✅ Buckets should be created. Try uploading an image to test.');
    } else {
      const postImagesBucket = buckets.find(bucket => bucket.name === 'post-images');
      const voiceNotesBucket = buckets.find(bucket => bucket.name === 'voice-notes');

      if (postImagesBucket) {
        console.log('✅ post-images bucket verified');
      } else {
        console.log('❌ post-images bucket not found');
      }

      if (voiceNotesBucket) {
        console.log('✅ voice-notes bucket verified');
      } else {
        console.log('❌ voice-notes bucket not found');
      }
    }

    console.log('\n🎉 Storage setup complete!');
    console.log('You can now try uploading images in your social feed.');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please follow the instructions in STORAGE_BUCKET_SETUP.md');
  }
}

createStorageBucketsFixed();
