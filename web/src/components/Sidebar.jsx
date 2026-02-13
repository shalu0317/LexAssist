import {
  MessageSquare,
  LayoutTemplate,
  FolderKanban,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  Calendar,
  Phone,
  MessageCircleMore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "@/components/UserContext";
import { ChatHistoryDropdown } from "@/components/ChatHistoryDropdown";

const navigationItems = [
  { icon: MessageSquare, label: "New Chat", to: "/", isNewChat: true },
  { icon: MessageCircleMore, label: "Call Summary", to: "/call-summary" },
  { icon: Calendar, label: "Calendar", to: "/calendar" },
  { icon: Settings, label: "Settings", to: "/settings" },
];


export function Sidebar({ isOpen, onToggle, handleSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const handleNavigation = (path, isNewChat = false) => {
    if (path == "/") {
      navigate(path, {
        state: {
          refresh: true
        }
      });
    } else {
      navigate(path);
    }

  };

  const handleLogout = () => {
    // Clear all localStorage data
    // localStorage.clear();
    // Call the parent sign out handler
    handleSignOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-sidebar-background/70 backdrop-blur-sm z-40 lg /* original type: hidden */"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          " left-0 top-0 h-full bg-sidebar-background/70 border-r border-sidebar-border z-50 flex flex-col transition-smooth relative overflow-hidden",
          isOpen ? "w-64" : "w-0 lg /* original type: w */-64"
        )}
      >
        {/* Subtle highlight gradient at top */}
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, hsl(240 65% 60% / 0.15) 0%, transparent 60%)",
          }}
        />
        {/* Header */}
        {/* <div className="flex items-center justify-between p-4 relative z-10">
      
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="w-5 h-5" />
          </Button>
        </div> */}

        {/* Navigation */}
        <nav className="p-3 space-y-1 relative z-10">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.to, item.isNewChat)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth",
                  isActive && !item.isNewChat
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Chat History Dropdown - with flex-1 to take remaining space */}
        <div className="flex-1 relative z-10 overflow-hidden flex flex-col min-h-0">
          <ChatHistoryDropdown />
        </div>

        {/* Pro Plan Card */}
        {/* <div className="p-4 border-t border-sidebar-border relative z-10">
          <div className="relative p-4 rounded-xl gradient-primary overflow-hidden shadow-glow">
            <div className="relative space-y-3">
              <button className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1">
                <p className="font-semibold text-white">Pro Plan</p>
                <p className="text-sm text-white/80">
                  Strengthen artificial intelligence. get plan!
                </p>
              </div>
              <p className="text-2xl font-bold text-white">$10 / mo</p>
              <Button className="w-full bg-white text-primary hover:bg-white/90">
                Get PRO
              </Button>
            </div>
          </div>
        </div> */}

        {/* Logout */}
        {user && <div className="p-4 border-t border-sidebar-border relative z-10">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log out
          </Button>
        </div>}
      </aside>
    </>
  );
}