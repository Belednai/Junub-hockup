# Stories Feature Setup Guide

This guide will help you fully activate the WhatsApp-style Stories feature in the Junub-hockup app.

## Prerequisites

- Supabase project set up and connected
- Supabase CLI installed and authenticated
- Access to your Supabase dashboard

## Step 1: Apply Database Migration

### Option A: Using NPM Scripts (Easiest)

**First, authenticate with Supabase:**
```bash
npx supabase login
```

**Then run the complete setup:**
```bash
npm run stories:setup
```

This will automatically:
- Link your Supabase project
- Apply the database migration
- Enable full Stories functionality

### Option B: Using Supabase CLI (Manual)

1. **Authenticate with Supabase CLI:**
   ```bash
   npx supabase login
   ```

2. **Link your project:**
   ```bash
   npm run stories:link
   ```

3. **Apply the migration:**
   ```bash
   cd supabase && npx supabase db push
   ```

4. **Enable functionality:**
   ```bash
   npm run stories:enable
   ```

### Option B: Manual SQL Execution

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250823154600_add_user_stories.sql`
4. Execute the SQL

## Step 2: Verify Database Setup

After applying the migration, verify these tables exist in your database:
- `user_stories`
- `story_views` 
- `story_reactions`

And verify the storage bucket `story-images` was created.

## Step 3: Enable Full Functionality

The Stories component is currently in "preview mode". To enable full functionality:

1. **Update the fetchStories function** in `src/components/Stories.tsx`
2. **Update the createStory function** in `src/components/Stories.tsx`

## Step 4: Test the Feature

1. **Sign up/Login** to the app
2. **Navigate to Social Feed** (`/social`)
3. **Click the "+" button** to create a story
4. **Upload images** and add captions
5. **View stories** by clicking on story circles

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error:**
   - Ensure the storage bucket was created by the migration
   - Check bucket permissions in Supabase dashboard

2. **"Table doesn't exist" error:**
   - Verify the migration was applied successfully
   - Check the database schema in Supabase dashboard

3. **Authentication issues:**
   - Ensure users are properly authenticated before accessing stories
   - Check RLS policies are correctly applied

### Manual Storage Bucket Creation:

If the storage bucket wasn't created automatically:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `story-images`
3. Set it as public
4. Apply the RLS policies from the migration file

## Features Overview

Once activated, users can:
- ✅ Create stories with up to 2 images
- ✅ Add captions to stories
- ✅ View stories in full-screen mode
- ✅ Navigate between stories
- ✅ Like stories
- ✅ Message story creators
- ✅ See visual indicators for viewed/unviewed stories
- ✅ Auto-expire stories after 12 hours

## Support

If you encounter any issues during setup, check:
1. Supabase project permissions
2. Database connection
3. Storage bucket configuration
4. RLS policies
