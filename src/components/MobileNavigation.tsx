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

export function MobileNavigation() {
  const { user } = useAuth();

  const items = user ? [
    { title: "Home", url: "/", icon: Home },
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Friends", url: "/find-friends", icon: Users },
    { title: "Chat", url: "/chat", icon: MessageCircle },
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
              `flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}