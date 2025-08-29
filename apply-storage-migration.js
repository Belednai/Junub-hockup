import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStorageMigration() {
  try {
    console.log('🔧 Applying storage migration...\n');

    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/20250822211940_add_post_images.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`✅ Statement ${i + 1}: Already exists (skipping)`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
          }
        } else {
          console.log(`✅ Statement ${i + 1}: Success`);
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
      }
    }

    console.log('\n🔍 Verifying storage bucket creation...');
    
    // Check if buckets were created
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError.message);
    } else {
      const postImagesBucket = buckets.find(bucket => bucket.name === 'post-images');
      
      if (postImagesBucket) {
        console.log('✅ post-images bucket exists');
      } else {
        console.log('❌ post-images bucket not found');
        
        // Try to create it manually
        console.log('🔧 Attempting manual bucket creation...');
        const { data: createData, error: createError } = await supabase.storage
          .createBucket('post-images', { public: true });
          
        if (createError) {
          console.error('❌ Manual bucket creation failed:', createError.message);
        } else {
          console.log('✅ post-images bucket created manually');
        }
      }
    }

    console.log('\n🎉 Migration application complete!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

applyStorageMigration();
