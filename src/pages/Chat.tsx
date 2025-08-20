import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Send, Users, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at?: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
}

interface Conversation {
  user_id: string;
  full_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      if (userId) {
        fetchUserProfile(userId);
        fetchMessages(userId);
      }
    }
  }, [user, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      // Get all direct messages involving the user
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select(`
          sender_id,
          receiver_id,
          message,
          created_at
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get unique user IDs and create conversations
      const userIds = new Set<string>();
      messagesData?.forEach(msg => {
        const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        userIds.add(otherUserId);
      });

      // Fetch profiles for these users
      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', Array.from(userIds));

        if (profilesError) throw profilesError;

        // Create conversation objects
        const convos: Conversation[] = profilesData?.map(profile => {
          const userMessages = messagesData?.filter(msg => 
            (msg.sender_id === profile.user_id && msg.receiver_id === user?.id) ||
            (msg.receiver_id === profile.user_id && msg.sender_id === user?.id)
          ) || [];

          const lastMessage = userMessages[0];
          const unreadCount = userMessages.filter(msg => 
            msg.sender_id === profile.user_id && msg.receiver_id === user?.id
          ).length;

          return {
            user_id: profile.user_id,
            full_name: profile.full_name || 'Love Friend',
            last_message: lastMessage?.message || '',
            last_message_time: lastMessage?.created_at || '',
            unread_count: unreadCount
          };
        }) || [];

        setConversations(convos);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUserProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setSelectedUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMessages = async (targetUserId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', targetUserId)
        .eq('receiver_id', user?.id)
        .is('read_at', null);

    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUser) return;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUser.user_id,
          message: newMessage.trim()
        });

      if (error) throw error;

      toast({
        title: "Message sent! 💌",
        description: "Your love message is on its way!"
      });

      setNewMessage('');
      fetchMessages(selectedUser.user_id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 text-secondary wiggle mx-auto mb-4" />
          <p>Loading your love chats...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-2rem)]">
          {/* Conversations Sidebar */}
          <Card className="comic-card lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-secondary" />
                  Love Chats
                </CardTitle>
                <div className="hidden lg:flex gap-1">
                  <Link to="/find-friends">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <Home className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground text-sm">No conversations yet!</p>
                    <Link to="/find-friends">
                      <Button className="mt-2 btn-hero" size="sm">
                        Find Love Friends
                      </Button>
                    </Link>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <Link
                      key={conv.user_id}
                      to={`/chat/${conv.user_id}`}
                      className={`block p-3 hover:bg-muted/50 transition-colors ${
                        selectedUser?.user_id === conv.user_id ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conv.full_name}</p>
                            {conv.unread_count > 0 && (
                              <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message || 'Start a love conversation!'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="comic-card lg:col-span-2">
            {selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedUser.full_name || 'Love Friend'}</h3>
                      <p className="text-sm text-muted-foreground">Spread some love! 💕</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col h-[60vh]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {loadingMessages ? (
                      <p className="text-center text-muted-foreground">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start your first love conversation!</p>
                        <p className="text-sm">Say hello and spread some positivity! ✨</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id === user.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t pt-4 pb-20 lg:pb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Send a loving message... 💕"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} className="btn-hero">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-bold mb-2">Choose a Love Friend to Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a conversation from the sidebar or find new love friends!
                  </p>
                  <Link to="/find-friends">
                    <Button className="btn-hero">
                      <Users className="h-4 w-4 mr-2" />
                      Find Love Friends
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
