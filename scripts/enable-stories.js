#!/usr/bin/env node

/**
 * Script to enable full Stories functionality after database migration
 * Run this after applying the database migration to activate all features
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORIES_COMPONENT_PATH = path.join(__dirname, '../src/components/Stories.tsx');

console.log('🚀 Enabling Stories functionality...');

try {
  // Read the current Stories component
  let content = fs.readFileSync(STORIES_COMPONENT_PATH, 'utf8');

  // Enable fetchStories function
  content = content.replace(
    /\/\/ For now, return empty array since tables don't exist yet[\s\S]*?\/\/ TODO: Uncomment and implement this once migration is applied[\s\S]*?\/\/ This will fetch stories from the database and populate the UI/,
    `// Fetch all active stories with user profiles, reactions, and views
      const { data: storiesData, error } = await supabase
        .from('user_stories')
        .select(\`
          id,
          user_id,
          image_url,
          caption,
          created_at,
          expires_at,
          story_reactions (id, user_id, reaction_type),
          story_views (id, viewer_id)
        \`)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(storiesData?.map(story => story.user_id) || [])];

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create profiles map
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Group stories by user
      const groupedStories = new Map();
      
      storiesData?.forEach(story => {
        const profile = profilesMap.get(story.user_id);
        const hasUnviewed = !story.story_views?.some(view => view.viewer_id === user?.id);
        
        if (!groupedStories.has(story.user_id)) {
          groupedStories.set(story.user_id, {
            user_id: story.user_id,
            user_name: profile?.full_name || 'Unknown User',
            avatar_url: profile?.avatar_url,
            stories: [],
            hasUnviewed: false
          });
        }

        const group = groupedStories.get(story.user_id);
        group.stories.push({
          ...story,
          profiles: profile
        });
        
        if (hasUnviewed) {
          group.hasUnviewed = true;
        }
      });

      // Convert to array and sort (user's own stories first, then by most recent)
      const sortedGroups = Array.from(groupedStories.values()).sort((a, b) => {
        if (a.user_id === user?.id) return -1;
        if (b.user_id === user?.id) return 1;
        return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime();
      });

      setStoryGroups(sortedGroups);`
  );

  // Enable createStory function
  content = content.replace(
    /\/\/ Temporarily disabled until database migration is applied[\s\S]*?setCaption\(''\);/,
    `setIsUploading(true);
    try {
      const uploadPromises = selectedImages.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = \`\${user.id}/\${Date.now()}-\${index}.\${fileExt}\`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('story-images')
          .getPublicUrl(uploadData.path);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create stories for each image
      const storyPromises = imageUrls.map(imageUrl => 
        supabase
          .from('user_stories')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            caption: caption || null
          })
      );

      await Promise.all(storyPromises);

      toast({
        title: "Success",
        description: "Story created successfully!",
      });

      setIsCreateDialogOpen(false);
      setSelectedImages([]);
      setCaption('');
      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }`
  );

  // Write the updated content back to the file
  fs.writeFileSync(STORIES_COMPONENT_PATH, content, 'utf8');

  console.log('✅ Stories functionality enabled successfully!');
  console.log('📱 Users can now create and view stories');
  console.log('🔄 The development server will automatically reload');

} catch (error) {
  console.error('❌ Error enabling Stories functionality:', error.message);
  process.exit(1);
}
