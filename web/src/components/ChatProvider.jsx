// ChatStore.jsx
import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messagesByThread, setMessagesByThread] = useState({});

  // Add message to a specific chat
  const addMessage = (threadId, message) => {
    console.log("threadId",threadId," message ", message)
    setMessagesByThread((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), message]
    }));
  };

  // Clear a chat (optional)
  const clearChat = (threadId) => {
    setMessagesByThread((prev) => {
      const copy = { ...prev };
      delete copy[threadId];
      return copy;
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messagesByThread,
        addMessage,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatStore = () => useContext(ChatContext);
