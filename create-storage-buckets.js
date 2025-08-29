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

async function createStorageBuckets() {
  try {
    console.log('🪣 Creating missing storage buckets...\n');

    // Create post-images bucket
    console.log('Creating post-images bucket...');
    const { data: postImagesData, error: postImagesError } = await supabase.storage
      .createBucket('post-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (postImagesError) {
      if (postImagesError.message.includes('already exists')) {
        console.log('✅ post-images bucket already exists');
      } else {
        console.error('❌ Error creating post-images bucket:', postImagesError.message);
      }
    } else {
      console.log('✅ post-images bucket created successfully');
    }

    // Create voice-notes bucket
    console.log('Creating voice-notes bucket...');
    const { data: voiceNotesData, error: voiceNotesError } = await supabase.storage
      .createBucket('voice-notes', {
        public: true,
        allowedMimeTypes: ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'],
        fileSizeLimit: 10485760 // 10MB
      });

    if (voiceNotesError) {
      if (voiceNotesError.message.includes('already exists')) {
        console.log('✅ voice-notes bucket already exists');
      } else {
        console.error('❌ Error creating voice-notes bucket:', voiceNotesError.message);
      }
    } else {
      console.log('✅ voice-notes bucket created successfully');
    }

    // Verify buckets were created
    console.log('\n🔍 Verifying buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

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

    console.log('\n🎉 Storage bucket setup complete!');
    console.log('\nNote: If bucket creation failed due to permissions, you may need to:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage section');
    console.log('3. Manually create the buckets:');
    console.log('   - post-images (public, 5MB limit)');
    console.log('   - voice-notes (public, 10MB limit)');

  } catch (error) {
    console.error('❌ Error during bucket creation:', error);
  }
}

createStorageBuckets();
