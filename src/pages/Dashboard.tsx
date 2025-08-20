import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Plus, Trash2, GamepadIcon, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchMessages();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
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
      fetchPosts();
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

      fetchPosts();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-secondary wiggle mx-auto mb-4" />
          <p>Loading your love dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
              <h1 className="text-3xl font-bold gradient-text">Love Dashboard</h1>
              <p className="text-muted-foreground">Your personal love sanctuary</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/games">
              <Button variant="outline" className="flex items-center gap-2">
                <GamepadIcon className="h-4 w-4" />
                Love Games
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

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
                ) : posts.length === 0 ? (
                  <p className="text-muted-foreground text-center">No captions yet. Share some self-love! 💝</p>
                ) : (
                  posts.map((post) => (
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
      </div>
    </div>
  );
};

export default Dashboard;