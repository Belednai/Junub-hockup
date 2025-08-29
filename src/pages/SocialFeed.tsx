import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Users, Home, TrendingUp, Clock } from 'lucide-react';
import { Stories } from '@/components/Stories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('recent');
  const [postLimits, setPostLimits] = useState({ posts: 0, imagePosts: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingPosts) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoadingPosts, hasMorePosts]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchPosts();
      fetchTrendingPosts();
      fetchPostLimits();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (page > 0) {
      loadMorePosts();
    }
  }, [page]);

  const fetchPostLimits = async () => {
    if (!user) return;
    
    try {
      // For now, just count posts created today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayPosts, error } = await supabase
        .from('user_posts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (error) throw error;
      
      const totalPosts = todayPosts?.length || 0;
      // For now, assume all posts could have images until migration is applied
      const imagePosts = Math.min(totalPosts, 2);
      
      setPostLimits({
        posts: totalPosts,
        imagePosts: imagePosts
      });
    } catch (error) {
      console.error('Error fetching post limits:', error);
      // Set default limits if there's an error
      setPostLimits({ posts: 0, imagePosts: 0 });
    }
  };

  const fetchPosts = async (pageNum = 0, append = false) => {
    try {
      const limit = 10;
      const offset = pageNum * limit;

      // Get posts with reactions and comments (basic query for now)
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
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) throw postsError;

      // Get comment IDs to fetch reactions and replies separately
      const commentIds = postsData?.flatMap(post => 
        post.post_comments?.map(comment => comment.id) || []
      ) || [];

      // Fetch comment reactions and replies if we have comments
      let commentReactions: any[] = [];
      let commentReplies: any[] = [];

      if (commentIds.length > 0) {
        try {
          // Try to fetch comment reactions
          const { data: reactionsData } = await (supabase as any)
            .from('comment_reactions')
            .select('id, comment_id, reaction_type, user_id')
            .in('comment_id', commentIds);
          commentReactions = reactionsData || [];
        } catch (error) {
          console.log('Comment reactions table not available yet');
        }

        try {
          // Try to fetch comment replies
          const { data: repliesData } = await (supabase as any)
            .from('comment_replies')
            .select('id, comment_id, content, user_id, created_at')
            .in('comment_id', commentIds);
          commentReplies = repliesData || [];
        } catch (error) {
          console.log('Comment replies table not available yet');
        }
      }

      // Get all unique user IDs from posts, comments, and replies
      const userIds = new Set<string>();
      postsData?.forEach(post => {
        userIds.add(post.user_id);
        post.post_comments?.forEach(comment => userIds.add(comment.user_id));
      });
      commentReplies?.forEach(reply => userIds.add(reply.user_id));

      // Get profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Create maps for reactions and replies
      const reactionsMap = new Map();
      commentReactions?.forEach(reaction => {
        if (!reactionsMap.has(reaction.comment_id)) {
          reactionsMap.set(reaction.comment_id, []);
        }
        reactionsMap.get(reaction.comment_id).push(reaction);
      });

      const repliesMap = new Map();
      commentReplies?.forEach(reply => {
        if (!repliesMap.has(reply.comment_id)) {
          repliesMap.set(reply.comment_id, []);
        }
        repliesMap.get(reply.comment_id).push({
          ...reply,
          profiles: profilesMap.get(reply.user_id)
        });
      });

      // Combine posts with profile data
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id),
        reactions: post.post_reactions,
        comments: post.post_comments
          ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          ?.map(comment => ({
            ...comment,
            profiles: profilesMap.get(comment.user_id),
            comment_reactions: reactionsMap.get(comment.id) || [],
            comment_replies: repliesMap.get(comment.id) || []
          })) || []
      }));

      if (append) {
        setPosts(prev => [...prev, ...(postsWithProfiles || [])]);
      } else {
        setPosts(postsWithProfiles || []);
      }

      setHasMorePosts((postsData?.length || 0) === limit);
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

  const fetchTrendingPosts = async () => {
    try {
      // For now, just get recent posts with most interactions as "trending"
      const { data: trendingData, error: trendingError } = await supabase
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
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (trendingError) throw trendingError;

      // Sort by interaction count (likes + comments) to simulate trending
      const postsWithInteractionCount = trendingData?.map(post => ({
        ...post,
        interactionCount: (post.post_reactions?.length || 0) + (post.post_comments?.length || 0)
      })).sort((a, b) => b.interactionCount - a.interactionCount).slice(0, 5);

      // Get profiles for trending posts
      const userIds = new Set<string>();
      postsWithInteractionCount?.forEach(post => {
        userIds.add(post.user_id);
        post.post_comments?.forEach(comment => userIds.add(comment.user_id));
      });

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      const trendingWithProfiles = postsWithInteractionCount?.map(post => ({
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

      setTrendingPosts(trendingWithProfiles || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || isLoadingPosts) return;
    setIsLoadingPosts(true);
    await fetchPosts(page, true);
  };

  const createPost = async () => {
    if (!user || (!newPostCaption.trim() && !audioBlob && selectedImages.length === 0)) {
      return;
    }

    // Check post limits
    if (postLimits.posts >= 10) {
      toast({
        title: "Daily limit reached",
        description: "You can only create 10 posts per day",
        variant: "destructive"
      });
      return;
    }

    if (selectedImages.length > 0 && postLimits.imagePosts >= 2) {
      toast({
        title: "Daily image limit reached",
        description: "You can only create 2 posts with images per day",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      let audioUrl = null;
      let imageUrls: string[] = [];

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

      // Upload images if exist
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const fileName = `${user.id}/${Date.now()}-${image.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(uploadData.path);

          imageUrls.push(publicUrl);
        }
      }

      // Create the post (without images column for now)
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
      setSelectedImages([]);
      fetchPosts();
      fetchPostLimits();
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
      // Check if user already liked this comment (using any to bypass TypeScript)
      const { data: existingReaction } = await (supabase as any)
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // Remove the like
        await (supabase as any)
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add the like
        await (supabase as any)
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: 'like'
          });
      }

      // Refresh posts to show updated reactions
      fetchPosts();
    } catch (error) {
      console.error('Error handling comment like:', error);
      toast({
        title: "Error",
        description: "Failed to update comment reaction",
        variant: "destructive"
      });
    }
  };

  const handleCommentReply = async (commentId: string, content: string) => {
    if (!user) return;

    try {
      await (supabase as any)
        .from('comment_replies')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          content: content.trim()
        });

      toast({
        title: "Success",
        description: "Reply added successfully!",
      });

      // Refresh posts to show the new reply
      fetchPosts();
    } catch (error) {
      console.error('Error creating comment reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive"
      });
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
      {/* Sticky Navigation */}
      <div className="sticky top-14 z-40 bg-gradient-to-br from-pink-50 to-purple-50/95 backdrop-blur-md border-b border-pink-100/50">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 min-w-0">
          <div className="flex justify-between items-center min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-heart truncate flex-shrink-0">Social Feed</h1>
            <div className="hidden lg:flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/find-friends')}>
                <Users className="h-4 w-4 mr-2" />
                Friends
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        {/* Stories Section */}
        <Stories />

        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Create a Post
              <div className="text-sm text-muted-foreground">
                Daily: {postLimits.posts}/10 posts, {postLimits.imagePosts}/2 with images
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostCaption}
              onChange={(e) => setNewPostCaption(e.target.value)}
              className="min-h-[80px]"
            />
            
            {/* Image Upload */}
            <ImageUpload
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={2}
              disabled={isCreatingPost}
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
                disabled={isCreatingPost || (!newPostCaption.trim() && !audioBlob && selectedImages.length === 0)}
                className="w-full sm:w-auto"
              >
                {isCreatingPost ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Feed Tabs */}
        <div className="sticky top-[120px] sm:top-[140px] z-30 bg-gradient-to-br from-pink-50 to-purple-50 backdrop-blur-sm border-b border-pink-100/50 py-4 -mx-3 sm:-mx-4 px-3 sm:px-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="recent" className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Recent</span>
                <span className="sm:hidden">New</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Trending</span>
                <span className="sm:hidden">Hot</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Feed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="recent" className="space-y-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    ref={index === posts.length - 1 ? lastPostElementRef : null}
                  >
                    <PostCard
                      post={post}
                      currentUserId={user?.id || ''}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onCommentLike={handleCommentLike}
                      onCommentReply={handleCommentReply}
                    />
                  </div>
                ))}
                {isLoadingPosts && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="animate-pulse text-muted-foreground">Loading more posts...</div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {trendingPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No trending posts this week. Start engaging with posts to see trending content!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mix trending posts with recent posts for Facebook-like experience */}
                {[...trendingPosts, ...posts.slice(0, 5)].map((post, index) => (
                  <PostCard
                    key={`${post.id}-${index}`}
                    post={post}
                    currentUserId={user?.id || ''}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onCommentLike={handleCommentLike}
                    onCommentReply={handleCommentReply}
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
