import { 
  Home, 
  Users, 
  MessageCircle, 
  Rss, 
  Gamepad2,
  Bell
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { NotificationCenter } from "./NotificationCenter";

export function MobileNavigation() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotificationCount();
      
      // Set up real-time subscription for unread count
      const subscription = supabase
        .channel('unread_messages')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'direct_messages',
            filter: `receiver_id=eq.${user.id}`
          }, 
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      // Set up real-time subscription for notifications
      const notificationSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchNotificationCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        notificationSubscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      // Count unread messages directly from direct_messages table
      const { data, error } = await supabase
        .from('direct_messages')
        .select('id')
        .eq('receiver_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadNotificationCount(user.id);
      setNotificationCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const items = user ? [
    { title: "Home", url: "/social", icon: Home },
    { title: "Friends", url: "/find-friends", icon: Users },
    { title: "Chat", url: "/chat", icon: MessageCircle, badge: unreadCount },
    { title: "Games", url: "/games", icon: Gamepad2 },
  ] : [
    { title: "Home", url: "/", icon: Home },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 min-w-0">
        <div className="flex items-center justify-around py-2 px-2 max-w-full overflow-hidden min-w-0">
          {items.slice(0, 4).map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors relative ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.title === "Chat" && item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.title}</span>
            </NavLink>
          ))}
          
          {user && (
            <button
              onClick={() => setShowNotifications(true)}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground hover:text-foreground relative"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">Alerts</span>
            </button>
          )}
        </div>
      </nav>
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
