import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Bell, Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 glass border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop search */}
              <div className="hidden lg:block">
                <GlobalSearch onAIClick={() => setAiOpen(true)} />
              </div>
              
              {/* Mobile AI button */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setAiOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 animate-fade-in">{children}</div>
      </main>
      <AIAssistantPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
