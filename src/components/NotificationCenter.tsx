import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Heart, MessageCircle, UserPlus, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: any;
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleFriendRequest = async (notificationId: string, requestId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accept' ? 'Friend request accepted!' : 'Friend request rejected',
        description: action === 'accept' ? 'You are now friends!' : 'Friend request has been declined.',
      });

      // Mark notification as read
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to handle friend request',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'friend_request':
      case 'friend_request_accepted':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No notifications yet!</p>
                <p className="text-sm text-muted-foreground">
                  You'll see likes, comments, and friend requests here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="ml-2">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          <div className="flex gap-2">
                            {notification.type === 'friend_request' && !notification.read && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFriendRequest(
                                    notification.id,
                                    notification.data.request_id,
                                    'accept'
                                  )}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFriendRequest(
                                    notification.id,
                                    notification.data.request_id,
                                    'reject'
                                  )}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {!notification.read && notification.type !== 'friend_request' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
