# Supabase Setup Guide - Fixing Social Feed Errors

This guide addresses the 404 and 400 errors you're experiencing in your social feed application.

## 🔍 Issues Identified

Based on the error analysis, the following issues were found:

### ✅ Working Components
- Database connection is successful
- `comment_replies` table exists
- `comment_reactions` table exists
- Basic post functionality works

### ❌ Missing Components
- `post-images` storage bucket (causing 400 errors)
- `voice-notes` storage bucket (for audio uploads)

## 🛠️ Solutions

### Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/btsnjqeqyhcybiaiutop
   - Login with your Supabase account

2. **Create Storage Buckets**
   - Navigate to **Storage** in the left sidebar
   - Click **"New bucket"**
   
   **Create post-images bucket:**
   - Name: `post-images`
   - Public bucket: ✅ **Yes**
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`
   
   **Create voice-notes bucket:**
   - Name: `voice-notes`
   - Public bucket: ✅ **Yes**
   - File size limit: `10485760` (10MB)
   - Allowed MIME types: `audio/wav,audio/mp3,audio/ogg,audio/webm`

3. **Verify Setup**
   - Run: `node fix-supabase-issues.js`
   - Should show ✅ for both buckets

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref btsnjqeqyhcybiaiutop
   ```

3. **Apply Migrations**
   ```bash
   supabase db push
   ```

### Option 3: SQL Commands (Advanced)

If you have access to the SQL Editor in Supabase Dashboard:

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

-- Set up storage policies for voice-notes
CREATE POLICY "Users can upload voice notes" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all voice notes" ON storage.objects 
FOR SELECT USING (bucket_id = 'voice-notes');
```

## 🧪 Testing the Fix

After setting up the storage buckets:

1. **Run the diagnostic script:**
   ```bash
   node fix-supabase-issues.js
   ```

2. **Expected output:**
   ```
   ✅ Connection successful
   ✅ comment_replies table exists
   ✅ comment_reactions table exists
   ✅ post-images bucket exists
   ✅ voice-notes bucket exists
   ```

3. **Test image upload:**
   - Go to your social feed
   - Try creating a post with an image
   - Should work without "Bucket not found" errors

## 🚨 Error Messages Explained

### Before Fix:
- `Failed to load resource: 404` - Tables missing (now fixed)
- `StorageApiError: Bucket not found` - Storage buckets missing
- `POST 400 (Bad Request)` - Upload failing due to missing bucket

### After Fix:
- All errors should be resolved
- Image uploads should work
- Voice note uploads should work
- Comment reactions and replies should work

## 📝 Additional Notes

- **File Size Limits:** Images are limited to 5MB, voice notes to 10MB
- **Supported Formats:** 
  - Images: JPEG, PNG, WebP, GIF
  - Audio: WAV, MP3, OGG, WebM
- **Security:** Only authenticated users can upload files to their own folders
- **Public Access:** All uploaded files are publicly accessible via URL

## 🔧 Troubleshooting

If you still encounter issues:

1. **Check bucket permissions** in Supabase Dashboard
2. **Verify RLS policies** are correctly set
3. **Clear browser cache** and try again
4. **Check network connectivity** to Supabase

## 📞 Support

If you need additional help:
- Check Supabase documentation: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com
- Review the error logs in browser developer tools

---

**Status:** Ready to implement ✅
**Priority:** High (blocks core functionality)
**Estimated Time:** 5-10 minutes
