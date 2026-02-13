import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useWebSocket } from "@/components/WebSocketProvider";
import { UserContext } from "@/components/UserContext";
import { useLayout } from "@/layouts/LayoutContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const Index = ({ }) => {
  const location = useLocation();
  const { encryptedId } = useParams();
  const { openAuthModal } = useLayout();
  const { user } = useContext(UserContext);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const { hydrateChatMessages, insertChatMessage, messagesByChat, sendMessage, isTyping } = useWebSocket();
  const [currentChatId, setCurrentChatId] = useState(location.state?.chatId ? location.state?.chatId : `chat-${(Date.now())}`);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messages = messagesByChat[currentChatId]?.messages || [];

  useEffect(() => {
    if (encryptedId) {
      const chatList = JSON.parse(localStorage.getItem("chatList")) || [];
      const matchingChat = chatList.find((chat) => chat.title === encryptedId);

      if (!matchingChat) {
        console.log("Chat not found, redirecting to home");
        navigate("/", { replace: true });
      } else if (!location.state?.chatId) {
        setCurrentChatId(matchingChat.id);
      }
    }
  }, [encryptedId, navigate, location.state?.chatId]);

  function mapFiles(fileList) {
    return Array.from(fileList).map(file => ({
      name: file.name,
      size: file.size,          // bytes
      type: file.type,          // MIME type
      lastModified: file.lastModified,
    }));
  }

  const handleSendMessage = (content, uploadedFiles) => {
    const chatId = currentChatId ?? `chat-${Date.now()}`;
    setCurrentChatId(chatId)
    let fileList = mapFiles(uploadedFiles)

    if (uploadedFiles) {
      setIsFileUploaded(true);
    }
    const userMessage = {
      id: `msg-${(Date.now() + 1)}`,
      content,
      role: "user",
      timestamp: new Date(),
      summary: localStorage.getItem("summary", ""),
      files: fileList,
    };

    insertChatMessage(currentChatId, userMessage) // hydrate messages into global store for the current chat
    console.log("-----sending request---", JSON.stringify(userMessage));

    console.log("----currentChatId is ------", currentChatId, chatId)
    const requestObj = {
      thread_id: chatId,
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      isFileUploaded: isFileUploaded,
    };
    sendMessage(JSON.stringify(requestObj))
  };

  const handleRegenerate = () => {
    console.log("Regenerate response");
  };

  useEffect(() => {
    const viewport = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;

    // Scroll user messages to top
    if (lastUserMessageRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        setTimeout(() => {
          if (lastUserMessageRef.current) {
            const elementTop = lastUserMessageRef.current.offsetTop;
            viewport.scrollTo({
              top: elementTop,
              behavior: "smooth",
            });
          }
        }, 50);
      }
    }

    // Attach scroll listener for button visibility
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    if (Object.keys(messagesByChat).length > 0) {
      localStorage.setItem("chatList", JSON.stringify(Object.values(messagesByChat)));
    }
    viewport.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => viewport.removeEventListener("scroll", handleScroll);


  }, [messages]);

  const scrollToBottom = () => {
    const viewport = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Subtle background highlight */}
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className=" mx-auto p-6 space-y-6 relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className="space-y-3"
              ref={
                message.role === "user" && index === messages.length - 1
                  ? lastUserMessageRef
                  : null
              }
            >
              <ChatMessage
                role={message.role}
                content={message.content}
                isTyping={false}
                sources={message.sources}
                files={message.files}
                openSidebar={() => setIsSourceOpen(!isSourceOpen)}
              />
            </div>
          ))}
          {isTyping && (
            <ChatMessage message="" role="assistant" isTyping={true} />
          )}
        </div>
        {!user && (
          <p className="text-m  font-bold text-center flex justify-center text-muted-foreground">
            To use TaxSurfer, you must log into your Google account.
            <p
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                openAuthModal();
              }}
            >
              Sign In
            </p>
          </p>
        )}
      </ScrollArea>
      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
      {/* Chat Input - Fixed at Bottom */}
      <div className="bg-background p-4 border-t">
        <ChatInput
          onSend={handleSendMessage}
          onRegenerate={handleRegenerate}
          conversationId={currentChatId}
          disabled={!user}
        />
      </div>
    </div>
  );
};

export default Index;
