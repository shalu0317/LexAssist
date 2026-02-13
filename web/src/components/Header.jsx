import { Menu, Search, Bell, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserContext } from "@/components/UserContext";
import { useContext } from "react";

const Header = ({
  onMenuClick,
  isSidebarOpen = true,
  onAuthClick
}) => {

  const { user } = useContext(UserContext);
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-sidebar-background/70 backdrop-blur-sm relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">TaxSurfer</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className={isSidebarOpen ? "lg:hidden" : ""}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="w-64 pl-9 border-input"
          />
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>

        {!user && (
          <Button
            variant="ghost"
            onClick={onAuthClick}
          >
            <User className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
