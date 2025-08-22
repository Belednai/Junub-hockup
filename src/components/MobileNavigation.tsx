import { 
  Home, 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  Rss, 
  Gamepad2
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function MobileNavigation() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
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

      return () => {
        subscription.unsubscribe();
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

  const items = user ? [
    { title: "Home", url: "/", icon: Home },
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Friends", url: "/find-friends", icon: Users },
    { title: "Chat", url: "/chat", icon: MessageCircle, badge: unreadCount },
    { title: "Social", url: "/social", icon: Rss },
    { title: "Games", url: "/games", icon: Gamepad2 },
  ] : [
    { title: "Home", url: "/", icon: Home },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {items.slice(0, 5).map((item) => (
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
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
