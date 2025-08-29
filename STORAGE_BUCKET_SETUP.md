# Storage Bucket Setup Guide

## 🚨 Issue
Your social feed is failing with the error: "Storage bucket not configured. Please contact support or check the setup guide."

## 🔍 Root Cause
The required storage buckets (`post-images` and `voice-notes`) are missing from your Supabase project. These buckets are needed for image and voice note uploads in posts.

## ✅ RECOMMENDED Solution: SQL Setup (Fastest)

**This is the quickest and most reliable method:**

1. Go to: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop/sql/new
2. Copy and paste the entire contents of `setup-storage-buckets.sql` file from your project root
3. Click "Run" to execute the SQL
4. You should see a success message and a table showing the created buckets

The SQL file will:
- Create both required storage buckets (`post-images` and `voice-notes`)
- Set up all necessary security policies
- Configure proper file size limits and MIME types
- Show verification results

## 🔧 Alternative: Manual Setup via Supabase Dashboard

If the SQL approach doesn't work, you can create them manually:

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop
2. Login with your Supabase account

### Step 2: Create Storage Buckets
1. Click on **"Storage"** in the left sidebar
2. Click **"New bucket"** button

#### Create post-images bucket:
- **Name**: `post-images`
- **Public bucket**: ✅ **Yes** (check this box)
- **File size limit**: `5242880` (5MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

#### Create voice-notes bucket:
- **Name**: `voice-notes` 
- **Public bucket**: ✅ **Yes** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `audio/wav,audio/mp3,audio/ogg,audio/webm`

### Step 3: Set Up Storage Policies
After creating the buckets, you need to set up Row Level Security (RLS) policies:

1. Go to **"Storage"** → **"Policies"**
2. For each bucket, create these policies:

#### For post-images bucket:
```sql
-- Allow users to upload images to their own folder
CREATE POLICY "Users can upload post images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view post images
CREATE POLICY "Users can view all post images" ON storage.objects 
FOR SELECT USING (bucket_id = 'post-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own post images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own post images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For voice-notes bucket:
```sql
-- Allow users to upload voice notes to their own folder
CREATE POLICY "Users can upload voice notes" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view voice notes
CREATE POLICY "Users can view all voice notes" ON storage.objects 
FOR SELECT USING (bucket_id = 'voice-notes');

-- Allow users to update their own voice notes
CREATE POLICY "Users can update their own voice notes" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own voice notes
CREATE POLICY "Users can delete their own voice notes" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 4: Verify Setup
After creating the buckets, run this command to verify:
```bash
node fix-supabase-issues.js
```

You should see:
```
✅ post-images bucket exists
✅ voice-notes bucket exists
```

## 🧪 Test the Fix
1. Go to your social feed application
2. Try creating a post with an image
3. The upload should now work without errors

## 🔧 Alternative: Quick SQL Setup
If you prefer to use SQL, go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true);

-- Create voice-notes bucket  
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-notes', 'voice-notes', true);

-- Set up storage policies for post-images
CREATE POLICY "Users can upload post images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all post images" ON storage.objects 
FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Users can update their own post images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up storage policies for voice-notes
CREATE POLICY "Users can upload voice notes" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all voice notes" ON storage.objects 
FOR SELECT USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can update their own voice notes" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice notes" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 📝 Important Notes
- **File Organization**: Files are stored in user-specific folders: `{user_id}/filename.ext`
- **Security**: Only authenticated users can upload files to their own folders
- **Public Access**: All uploaded files are publicly accessible via URL (needed for the app to display them)
- **File Limits**: Images max 5MB, voice notes max 10MB

## 🚨 Troubleshooting
If you still get errors after setup:
1. Clear your browser cache
2. Check that both buckets are marked as "public"
3. Verify the RLS policies are correctly applied
4. Check browser developer tools for specific error messages

## ⏱️ Estimated Time
- Manual setup: 5-10 minutes
- SQL setup: 2-3 minutes

---
**Status**: Requires manual intervention ⚠️  
**Priority**: High (blocks core functionality)
