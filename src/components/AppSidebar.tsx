import { 
  Home, 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  Activity, 
  Gamepad2,
  Heart,
  Sparkles
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const publicItems = [
    { title: "Home", url: "/", icon: Home },
  ];

  const authItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Find Friends", url: "/find-friends", icon: Users },
    { title: "Chat", url: "/chat", icon: MessageCircle },
    { title: "Social Feed", url: "/social", icon: Activity },
    { title: "Love Games", url: "/games", icon: Gamepad2 },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} hidden lg:flex transition-all duration-300`}
    >
      <SidebarContent className="pt-4">
        {/* Public Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Authenticated Navigation */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {!collapsed && "Features"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}