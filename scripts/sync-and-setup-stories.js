#!/usr/bin/env node

/**
 * Script to sync migrations and setup Stories functionality
 * Handles migration conflicts and applies the stories migration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Syncing migrations and setting up Stories...');

try {
  // Step 1: Pull remote migrations to sync
  console.log('📥 Pulling remote migrations...');
  execSync('cd supabase && npx supabase db pull', { stdio: 'inherit' });

  // Step 2: Apply our stories migration via SQL editor approach
  console.log('📋 Stories migration ready for manual application...');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250823154600_add_user_stories.sql');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the following SQL:');
  console.log('\n' + '='.repeat(50));
  console.log(migrationContent);
  console.log('='.repeat(50) + '\n');
  console.log('4. Execute the SQL');
  console.log('5. Run: npm run stories:enable');
  
  console.log('\n✅ Migration content prepared for manual execution');

} catch (error) {
  console.error('❌ Error during sync:', error.message);
  
  console.log('\n🔧 MANUAL SETUP INSTRUCTIONS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy the contents of: supabase/migrations/20250823154600_add_user_stories.sql');
  console.log('4. Execute the SQL in the editor');
  console.log('5. Run: npm run stories:enable');
}
