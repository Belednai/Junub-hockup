import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Users, Home } from 'lucide-react';


interface CommentReply {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
}

interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
  comment_reactions?: { id: string; reaction_type: string; user_id: string }[];
  comment_replies?: CommentReply[];
}

interface Post {
  id: string;
  caption: string;
  audio_url?: string;
  audio_duration?: number;
  images?: string[];
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
  reactions?: { id: string; reaction_type: string; user_id: string }[];
  comments?: CommentData[];
}

export default function SocialFeed() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchPosts();
    }
  }, [user, loading, navigate]);

  const fetchPosts = async () => {
    try {
      // First get posts with reactions and comments
      const { data: postsData, error: postsError } = await supabase
        .from('user_posts')
        .select(`
          id,
          caption,
          audio_url,
          audio_duration,
          created_at,
          user_id,
          post_reactions (id, reaction_type, user_id),
          post_comments (id, content, user_id, created_at)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      console.log('Posts data:', postsData);

      // Get all unique user IDs from posts and comments
      const userIds = new Set<string>();
      postsData?.forEach(post => {
        userIds.add(post.user_id);
        post.post_comments?.forEach(comment => userIds.add(comment.user_id));
      });

      console.log('User IDs to fetch profiles for:', Array.from(userIds));

      // Get profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      console.log('Profiles data:', profilesData);

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      console.log('Profiles map:', profilesMap);

      // Combine posts with profile data
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id),
        reactions: post.post_reactions,
        comments: post.post_comments
          ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          ?.map(comment => ({
            ...comment,
            profiles: profilesMap.get(comment.user_id)
          })) || []
      }));

      console.log('Posts with profiles:', postsWithProfiles);

      setPosts(postsWithProfiles || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const createPost = async () => {
    if (!user || (!newPostCaption.trim() && !audioBlob)) {
      return;
    }

    setIsCreatingPost(true);
    try {
      let audioUrl = null;

      // Upload audio if exists
      if (audioBlob) {
        const audioFile = new File([audioBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('voice-notes')
          .upload(`${user.id}/${audioFile.name}`, audioFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('voice-notes')
          .getPublicUrl(uploadData.path);
        
        audioUrl = publicUrl;
      }

      // Create the post
      const { data: postData, error: postError } = await supabase
        .from('user_posts')
        .insert({
          caption: newPostCaption || (audioBlob ? 'Voice note' : 'New post'),
          user_id: user.id,
          audio_url: audioUrl,
          audio_duration: audioDuration > 0 ? audioDuration : null
        })
        .select()
        .single();

      if (postError) throw postError;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setNewPostCaption('');
      setAudioBlob(null);
      setAudioDuration(0);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const existingReaction = posts
        .find(p => p.id === postId)
        ?.reactions?.find(r => r.user_id === user.id);

      if (existingReaction) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: 'like'
          });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        });

      fetchPosts();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleShare = async (postId: string, caption?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          shared_with_caption: caption
        });

      toast({
        title: "Success",
        description: "Post shared successfully!",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return;

    try {
      // For now, we'll implement this as a placeholder since the tables don't exist yet
      console.log('Comment like functionality will be available after migration');
      toast({
        title: "Info",
        description: "Comment reactions will be available soon!",
      });
    } catch (error) {
      console.error('Error handling comment like:', error);
    }
  };

  const handleCommentReply = async (commentId: string, content: string) => {
    if (!user) return;

    try {
      // For now, we'll implement this as a placeholder since the tables don't exist yet
      console.log('Comment reply functionality will be available after migration');
      toast({
        title: "Info",
        description: "Comment replies will be available soon!",
      });
    } catch (error) {
      console.error('Error creating comment reply:', error);
    }
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
  };

  if (loading || isLoadingPosts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-heart text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 overflow-x-hidden w-full">
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-heart truncate flex-shrink-0">Social Feed</h1>
          <div className="hidden lg:flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => navigate('/chat')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" onClick={() => navigate('/find-friends')}>
              <Users className="h-4 w-4 mr-2" />
              Friends
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostCaption}
              onChange={(e) => setNewPostCaption(e.target.value)}
              className="min-h-[80px]"
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
              <div className="flex-shrink-0">
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={isCreatingPost}
                />
              </div>
              
              <Button
                onClick={createPost}
                disabled={isCreatingPost || (!newPostCaption.trim() && !audioBlob)}
                className="w-full sm:w-auto"
              >
                {isCreatingPost ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id || ''}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onCommentLike={handleCommentLike}
                onCommentReply={handleCommentReply}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
