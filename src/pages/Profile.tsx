import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { ImageUpload } from '@/components/ImageUpload';
import { User, Upload, Camera, ArrowLeft, Heart, MessageCircle, Plus, Trash2, Users, GamepadIcon, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  profile_images?: string[];
  created_at: string;
  updated_at: string;
}

interface UserPost {
  id: string;
  caption: string;
  created_at: string;
}

interface UserMessage {
  id: string;
  message: string;
  created_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Dashboard functionality states
  const [dashboardPosts, setDashboardPosts] = useState<UserPost[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Profile images state
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [existingProfileImages, setExistingProfileImages] = useState<string[]>([]);
  const [uploadingProfileImages, setUploadingProfileImages] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const targetUserId = userId || user.id;
      setIsOwnProfile(!userId || userId === user.id);
      fetchProfile(targetUserId);
      fetchUserPosts(targetUserId);
      
      // Only fetch dashboard data for own profile
      if (!userId || userId === user.id) {
        fetchDashboardPosts();
        fetchMessages();
      }
    }
  }, [user, userId]);

  const fetchProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) {
        // If no profile exists and it's own profile, create one
        if (error.code === 'PGRST116' && isOwnProfile) {
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFullName(data.full_name || '');
        setExistingProfileImages(data.profile_images || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserPosts = async (targetUserId: string) => {
    try {
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
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get profile for the posts
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Combine posts with profile data
      const postsWithProfile = postsData?.map(post => ({
        ...post,
        profiles: profileData,
        reactions: post.post_reactions,
        comments: post.post_comments || []
      }));

      setUserPosts(postsWithProfile || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchDashboardPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDashboardPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.email?.split('@')[0] || 'User'
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setUploading(true);
      
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    try {
      setUpdating(true);
      
      let avatarUrl = profile.avatar_url;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(avatarFile);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarFile(null);
      
      toast({
        title: "Profile updated! ✨",
        description: "Your love profile looks amazing!"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user.id,
          caption: newPost.trim()
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your love caption has been shared with yourself 💕"
      });

      setNewPost('');
      fetchDashboardPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('user_messages')
        .insert({
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "You've messaged yourself - self-love is the best love! 💌"
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('user_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been removed"
      });

      fetchDashboardPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message deleted",
        description: "Your message has been removed"
      });

      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const uploadProfileImages = async (files: File[]): Promise<string[]> => {
    if (!user || !profile) return [];

    try {
      setUploadingProfileImages(true);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading profile images:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile images",
        variant: "destructive"
      });
      return [];
    } finally {
      setUploadingProfileImages(false);
    }
  };

  const updateProfileWithImages = async () => {
    if (!user || !profile) return;

    try {
      setUpdating(true);
      
      let avatarUrl = profile.avatar_url;
      let profileImagesUrls = existingProfileImages;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(avatarFile);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }

      // Upload new profile images if any
      if (profileImages.length > 0) {
        const newImageUrls = await uploadProfileImages(profileImages);
        if (newImageUrls.length > 0) {
          profileImagesUrls = [...existingProfileImages, ...newImageUrls].slice(0, 3); // Limit to 3 images
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          profile_images: profileImagesUrls,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarFile(null);
      setProfileImages([]);
      setExistingProfileImages(profileImagesUrls);
      
      toast({
        title: "Profile updated! ✨",
        description: "Your love profile looks amazing!"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-8 w-8 text-secondary wiggle mx-auto mb-4" />
          <p>Loading your love profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 p-4">
      <div className="container max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-secondary wiggle" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {isOwnProfile ? 'My Profile' : `${profile.full_name || 'User'}'s Profile`}
              </h1>
              <p className="text-muted-foreground">
                {isOwnProfile ? 'Your personal love sanctuary' : 'View profile and posts'}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="hidden lg:flex gap-2">
              <Link to="/find-friends">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Find Friends
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </Link>
              <Link to="/social">
                <Button variant="outline" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Social Feed
                </Button>
              </Link>
              <Link to="/games">
                <Button variant="outline" className="flex items-center gap-2">
                  <GamepadIcon className="h-4 w-4" />
                  Love Games
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Profile Edit Card - Only for Own Profile */}
        {isOwnProfile && (
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden">
                    {avatarFile ? (
                      <img
                        src={URL.createObjectURL(avatarFile)}
                        alt="New avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Current avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-secondary" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <Label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary-glow transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                {avatarFile && (
                  <p className="text-sm text-muted-foreground text-center">
                    New avatar selected: {avatarFile.name}
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label>Member Since</Label>
                  <Input
                    value={new Date(profile.created_at).toLocaleDateString()}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>

              {/* Profile Images Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Profile Images</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add up to 3 images so others can recognize you when viewing your profile
                  </p>
                  <ImageUpload
                    images={profileImages}
                    onImagesChange={setProfileImages}
                    maxImages={3 - existingProfileImages.length}
                    disabled={updating || uploadingProfileImages}
                  />
                </div>

                {/* Show existing profile images */}
                {existingProfileImages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Profile Images</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {existingProfileImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={imageUrl}
                              alt={`Profile image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Update Button */}
              <Button
                onClick={updateProfileWithImages}
                disabled={updating || uploading || uploadingProfileImages}
                className="btn-hero w-full"
              >
                {updating ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Updating Profile...
                  </>
                ) : uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Avatar...
                  </>
                ) : uploadingProfileImages ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Images...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Update Profile 💕
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile View for Other Users */}
        {!isOwnProfile && (
          <Card className="comic-card">
            <CardContent className="py-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.full_name || 'User'}</h2>
                  <p className="text-muted-foreground">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>

                {/* Profile Images for Recognition */}
                {profile.profile_images && profile.profile_images.length > 0 && (
                  <div className="w-full max-w-md">
                    <h3 className="text-sm font-medium text-center mb-3">Profile Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {profile.profile_images.map((imageUrl, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={imageUrl}
                            alt={`${profile.full_name || 'User'} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/chat/${profile.user_id}`}>
                    <Button className="btn-hero">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content - Only for Own Profile */}
        {isOwnProfile && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Posts Section */}
            <Card className="comic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-secondary" />
                  Love Captions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share a love caption with yourself... 💕"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <Button onClick={createPost} className="w-full btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Share Love Caption
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingPosts ? (
                    <p className="text-muted-foreground text-center">Loading your captions...</p>
                  ) : dashboardPosts.length === 0 ? (
                    <p className="text-muted-foreground text-center">No captions yet. Share some self-love! 💝</p>
                  ) : (
                    dashboardPosts.map((post) => (
                      <div key={post.id} className="bg-muted/30 p-3 rounded-lg space-y-2">
                        <p className="text-sm">{post.caption}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePost(post.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Messages Section */}
            <Card className="comic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-accent" />
                  Self Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Send yourself a loving message... 💌"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="w-full btn-hero">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Self-Love Message
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingMessages ? (
                    <p className="text-muted-foreground text-center">Loading your messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-muted-foreground text-center">No messages yet. Send yourself some love! 💕</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="bg-accent/10 p-3 rounded-lg space-y-2">
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Stats for Own Profile */}
        {isOwnProfile && (
          <Card className="comic-card">
            <CardContent className="py-6">
              <h3 className="font-bold mb-4 gradient-text text-center">Profile Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.full_name ? '✓' : '○'}</div>
                  <div className="text-sm text-muted-foreground">Name Set</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.avatar_url ? '✓' : '○'}</div>
                  <div className="text-sm text-muted-foreground">Avatar Set</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{userPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Posts */}
        <Card className="comic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {isOwnProfile ? 'My Posts' : `${profile.full_name || 'User'}'s Posts`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isOwnProfile ? 'You haven\'t posted anything yet!' : 'No posts yet.'}
                </p>
                {isOwnProfile && (
                  <Link to="/social">
                    <Button className="mt-4 btn-hero">
                      Create Your First Post
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id || ''}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                    onCommentLike={() => {}}
                    onCommentReply={() => {}}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
