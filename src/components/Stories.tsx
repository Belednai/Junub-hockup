import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Heart, MessageCircle, X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StoryReply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
  story_reactions?: { id: string; user_id: string; reaction_type: string }[];
  story_views?: { id: string; viewer_id: string }[];
  story_replies?: StoryReply[];
}

interface StoryGroup {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export function Stories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentStoryGroup, setCurrentStoryGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      // Fetch all active stories with user profiles, reactions, and views
      const { data: storiesData, error } = await supabase
        .from('user_stories')
        .select(`
          id,
          user_id,
          image_url,
          caption,
          created_at,
          expires_at,
          story_reactions (id, user_id, reaction_type),
          story_views (id, viewer_id)
        `)
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

      setStoryGroups(sortedGroups);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 2 images per story",
        variant: "destructive"
      });
      return;
    }
    setSelectedImages(files);
  };

  const createStory = async () => {
    if (!user || selectedImages.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = selectedImages.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
        
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
    }
  };

  const openStoryViewer = async (storyGroup: StoryGroup, startIndex = 0) => {
    setCurrentStoryGroup(storyGroup);
    setCurrentStoryIndex(startIndex);
    setIsViewerOpen(true);

    // Mark story as viewed if it's not the user's own story
    if (storyGroup.user_id !== user?.id && user) {
      const story = storyGroup.stories[startIndex];
      try {
        await supabase
          .from('story_views')
          .upsert({
            story_id: story.id,
            viewer_id: user.id
          });
      } catch (error) {
        console.error('Error marking story as viewed:', error);
      }
    }
  };

  const handleStoryReaction = async (storyId: string) => {
    if (!user) return;

    try {
      const story = currentStoryGroup?.stories[currentStoryIndex];
      const existingReaction = story?.story_reactions?.find(r => r.user_id === user.id);

      if (existingReaction) {
        await supabase
          .from('story_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: 'like'
          });
      }

      fetchStories();
    } catch (error) {
      console.error('Error handling story reaction:', error);
    }
  };

  const navigateStory = (direction: 'prev' | 'next') => {
    if (!currentStoryGroup) return;

    if (direction === 'next') {
      if (currentStoryIndex < currentStoryGroup.stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        // Move to next user's stories
        const currentGroupIndex = storyGroups.findIndex(g => g.user_id === currentStoryGroup.user_id);
        if (currentGroupIndex < storyGroups.length - 1) {
          openStoryViewer(storyGroups[currentGroupIndex + 1], 0);
        } else {
          setIsViewerOpen(false);
        }
      }
    } else {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else {
        // Move to previous user's stories
        const currentGroupIndex = storyGroups.findIndex(g => g.user_id === currentStoryGroup.user_id);
        if (currentGroupIndex > 0) {
          const prevGroup = storyGroups[currentGroupIndex - 1];
          openStoryViewer(prevGroup, prevGroup.stories.length - 1);
        }
      }
    }
  };

  const handleMessageUser = () => {
    if (currentStoryGroup && currentStoryGroup.user_id !== user?.id) {
      // Navigate to chat with this user
      window.location.href = `/chat?user=${currentStoryGroup.user_id}`;
    }
  };

  const handleStoryReply = async () => {
    if (!user || !replyText.trim() || !currentStoryGroup) return;

    setIsReplying(true);
    try {
      const storyId = currentStoryGroup.stories[currentStoryIndex].id;
      
      await supabase
        .from('story_replies')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: replyText.trim()
        });

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully!",
      });

      setReplyText('');
      fetchStories(); // Refresh to show the new reply
    } catch (error) {
      console.error('Error sending story reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-b border-pink-100/50 pt-8 px-4 pb-4 mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Add Story Button */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 hover:border-heart"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <span className="text-xs text-gray-600">Your Story</span>
          </div>

          {/* Story Groups */}
          {storyGroups.map((group) => (
            <div
              key={group.user_id}
              className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => openStoryViewer(group)}
            >
              <div className={`p-1 rounded-full ${group.hasUnviewed ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-300'}`}>
                <Avatar className="w-14 h-14 border-2 border-white">
                  <AvatarImage src={group.avatar_url} />
                  <AvatarFallback>
                    {group.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-gray-600 max-w-16 truncate">
                {group.user_id === user?.id ? 'You' : group.user_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Story Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Select up to 2 images</p>
            </div>
            
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedImages.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <Textarea
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createStory}
                disabled={selectedImages.length === 0 || isUploading}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Share Story'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-black">
          {currentStoryGroup && (
            <div className="relative h-[600px] flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentStoryGroup.avatar_url} />
                      <AvatarFallback>
                        {currentStoryGroup.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentStoryGroup.user_name}</p>
                      <p className="text-xs opacity-75">
                        {new Date(currentStoryGroup.stories[currentStoryIndex].created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsViewerOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress bars */}
                <div className="flex gap-1 mt-3">
                  {currentStoryGroup.stories.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded ${
                        index === currentStoryIndex ? 'bg-white' : 
                        index < currentStoryIndex ? 'bg-white/70' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Story Image */}
              <div className="flex-1 relative">
                <img
                  src={currentStoryGroup.stories[currentStoryIndex].image_url}
                  alt="Story"
                  className="w-full h-full object-contain"
                />

                {/* Navigation */}
                <button
                  onClick={() => navigateStory('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() => navigateStory('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>

              {/* Caption */}
              {currentStoryGroup.stories[currentStoryIndex].caption && (
                <div className="absolute bottom-20 left-4 right-4 text-white">
                  <p className="bg-black/50 p-3 rounded">
                    {currentStoryGroup.stories[currentStoryIndex].caption}
                  </p>
                </div>
              )}

              {/* Actions */}
              {currentStoryGroup.user_id !== user?.id && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStoryReaction(currentStoryGroup.stories[currentStoryIndex].id)}
                    className="text-white hover:bg-white/20"
                  >
                    <Heart className={`h-5 w-5 ${
                      currentStoryGroup.stories[currentStoryIndex].story_reactions?.some(r => r.user_id === user?.id)
                        ? 'fill-red-500 text-red-500' : ''
                    }`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMessageUser}
                    className="text-white hover:bg-white/20"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
