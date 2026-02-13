import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function ChatHistoryDropdown() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Load initial chat history
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    console.log("---loading chat history--");
    const savedHistory = localStorage.getItem("chatList");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem("chatList", JSON.stringify(updatedHistory));
  };

  const handleChatClick = (chat, index) => {

    console.log('-chat is ---', index)
    navigate(`/${chat.title}`, {
      state: {
        chatId: chat.id
      }
    });
  };

  if (chatHistory.length === 0) return null;

  return (
    <div className="flex flex-col h-full border-t border-sidebar-border">
      <Button
        variant="ghost"
        className="w-full justify-between px-3 py-2 h-auto font-medium flex-shrink-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm">Recent Chats</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth scrollbar-hide">
          <div className="space-y-1 px-2 pb-2">
            {chatHistory?.slice(0, 10).map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat, index)}
                className={cn(
                  "w-full flex items-start gap-2 p-2 rounded-md text-left transition-colors group",
                  "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
              >
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {chat.title || "Untitled Chat"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(chat.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
