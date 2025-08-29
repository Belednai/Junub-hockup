import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Send, Users, Home, ArrowLeft, Search, Phone, Video, Info, Smile, Plus, Image, Mic } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesBottomRef = useRef<HTMLDivElement>(null);

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
    messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
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

      const userIds = new Set<string>();
      messagesData?.forEach(msg => {
        const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        userIds.add(otherUserId);
      });

      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', Array.from(userIds));

        if (profilesError) throw profilesError;

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

        convos.sort((a, b) => {
          if (!a.last_message_time && !b.last_message_time) return 0;
          if (!a.last_message_time) return -1;
          if (!b.last_message_time) return 1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

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

  const filteredConversations = conversations.filter(conv =>
    conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-white dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-7 w-7 text-blue-500" />
              Chats
            </h1>
            <div className="flex gap-2">
              <Link to="/find-friends">
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchQuery ? 'No conversations found' : 'No conversations yet!'}
              </p>
              {!searchQuery && (
                <Link to="/find-friends">
                  <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <Link
                key={conv.user_id}
                to={`/chat/${conv.user_id}`}
                className={`block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  selectedUser?.user_id === conv.user_id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-r-blue-500' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {conv.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-slate-900"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate text-slate-900 dark:text-white text-lg">
                        {conv.full_name}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {conv.last_message_time && new Date(conv.last_message_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {conv.last_message || 'Start a conversation!'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-semibold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/chat')}
                    className="lg:hidden rounded-full h-10 w-10 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedUser.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {selectedUser.full_name || 'Love Friend'}
                    </h3>
                    <p className="text-sm text-green-500 font-medium">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                    <Video className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-blue-500 animate-pulse mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {selectedUser.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Start your conversation with a friendly message! 💕
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === user.id;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {selectedUser.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div className="w-8" />}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="break-words">{message.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesBottomRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 text-blue-500">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 text-blue-500">
                  <Image className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="rounded-full bg-slate-100 dark:bg-slate-800 border-0 pr-12 focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 p-0 text-blue-500"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                {newMessage.trim() ? (
                  <Button 
                    onClick={sendMessage} 
                    className="rounded-full h-10 w-10 p-0 bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 text-blue-500">
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-20 w-20 mx-auto mb-6 text-slate-300 dark:text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Choose a conversation
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                Select a conversation from the sidebar to start chatting, or find new friends to connect with!
              </p>
              <Link to="/find-friends">
                <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6">
                  <Users className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
