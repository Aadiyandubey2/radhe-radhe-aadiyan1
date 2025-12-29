import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wallet,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Shield,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImg from "@/assets/logo.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Trips", href: "/trips", icon: Route },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Admin", href: "/admin/categories", icon: Shield },
];

interface AppSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isMobile = false, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300",
        isMobile 
          ? "h-full w-full bg-sidebar" 
          : "glass-dark h-screen sticky top-0",
        !isMobile && (collapsed ? "w-20" : "w-64")
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Radhe Radhe Transport" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-sm leading-tight">राधे राधे</h1>
              <p className="text-xs text-sidebar-foreground/60">Transport Service</p>
            </div>
          </div>
        )}
        {collapsed && !isMobile && (
          <img src={logoImg} alt="Radhe Radhe" className="w-10 h-10 mx-auto rounded-xl object-cover" />
        )}
      </div>

      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "animate-pulse-slow")} />
              {(!collapsed || isMobile) && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => {
            signOut();
            handleNavClick();
          }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors",
            collapsed && !isMobile && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || isMobile) && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
