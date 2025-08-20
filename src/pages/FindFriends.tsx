import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, UserPlus, Users, Home, MessageCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
}

const FindFriends = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchFriendships();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchFriendships = async () => {
    try {
      const { data, error } = await supabase
        .from('user_friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

      if (error) throw error;
      setFriendships(data || []);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Friend request sent! 💕",
        description: "Your request is on its way to spread some love!"
      });

      fetchFriendships();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('user_friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Friend request accepted! 🎉",
        description: "You've made a new love connection!"
      });

      fetchFriendships();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    }
  };

  const getFriendshipStatus = (profileUserId: string) => {
    return friendships.find(f => 
      (f.user_id === user?.id && f.friend_id === profileUserId) ||
      (f.friend_id === user?.id && f.user_id === profileUserId)
    );
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 text-secondary wiggle mx-auto mb-4" />
          <p>Loading love connections...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingRequests = friendships.filter(f => 
    f.friend_id === user.id && f.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 p-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-secondary wiggle" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Find Love Friends</h1>
              <p className="text-muted-foreground">Connect with other members of our love community</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/chat">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Dashboard
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

        {/* Search */}
        <Card className="comic-card">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for love friends by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pending Friend Requests */}
        {pendingRequests.length > 0 && (
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                Pending Friend Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => {
                const profile = profiles.find(p => p.user_id === request.user_id);
                return (
                  <div key={request.id} className="flex items-center justify-between bg-accent/10 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{profile?.full_name || 'Love Friend'}</p>
                        <p className="text-sm text-muted-foreground">Wants to be your love friend!</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="btn-hero"
                      size="sm"
                    >
                      Accept 💕
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card className="comic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Love Community Members ({filteredProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProfiles ? (
              <p className="text-center text-muted-foreground">Loading love friends...</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {searchTerm ? 'No love friends found matching your search.' : 'No other members yet. Invite your friends to join!'}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProfiles.map((profile) => {
                  const friendship = getFriendshipStatus(profile.user_id);
                  const canSendRequest = !friendship;
                  const isPending = friendship?.status === 'pending';
                  const isAccepted = friendship?.status === 'accepted';
                  const isSentByMe = friendship?.user_id === user.id;

                  return (
                    <div key={profile.id} className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{profile.full_name || 'Love Friend'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {canSendRequest && (
                          <Button
                            onClick={() => sendFriendRequest(profile.user_id)}
                            className="btn-hero flex-1"
                            size="sm"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Send Love Request
                          </Button>
                        )}

                        {isPending && (
                          <Button variant="outline" className="flex-1" size="sm" disabled>
                            {isSentByMe ? 'Request Sent 💌' : 'Request Received ✨'}
                          </Button>
                        )}

                        {isAccepted && (
                          <Button variant="outline" className="flex-1" size="sm" disabled>
                            Love Friends 💕
                          </Button>
                        )}

                        <Link to={`/chat/${profile.user_id}`}>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="comic-card">
          <CardContent className="py-6 text-center">
            <h3 className="font-bold mb-2 gradient-text">How It Works</h3>
            <p className="text-sm text-muted-foreground">
              Send love friend requests to connect with other members! Once accepted, you can chat and share your love journey together. 
              Remember - this is all about spreading positivity and self-love! 💕
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindFriends;