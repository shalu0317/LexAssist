import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messagesByChat, setMessagesByChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const storedChats = localStorage.getItem("chatList");
    if (storedChats) {
      try {

        JSON.parse(storedChats).map(chat => {
          setMessagesByChat(prev => ({
            ...prev,
            [chat.id]: chat
          }))
        })
        // setMessagesByChat(JSON.parse(storedChats));
        console.log("📦 Restored chats from localStorage");
      } catch (e) {
        console.error("Failed to parse stored chats", e);
      }
    }
    // Open connection once when app mounts
    createSocketConnection()

    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (msg) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(msg);
      setIsTyping(true);
    }
  };

 
  const insertChatMessage = (chatId, message) => {

    if (messagesByChat[chatId] && messagesByChat[chatId].messages) {
      setMessagesByChat(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: [...(prev[chatId]?.messages || []), message]
        }
      }));
    } else {
      const chatMessage = {
        id: chatId,
        messages: [message],
        timestamp: new Date(),
        title: ""
      }
      setMessagesByChat(prev => ({
        ...prev,
        [chatId]: chatMessage
      }));
    }

    console.log("insertChatMessage for chatId", chatId, message);
    console.log("Current state after insertChatMessage", messagesByChat);
  };

  function generateChatTitle(chatHistory) {
    const firstAIMessage = chatHistory?.find((msg) => msg.role == "assistant");
    console.log("generateChatTitle - firstAIMessage:", firstAIMessage);
    if (firstAIMessage && firstAIMessage.title) {
      // Use first 50 chars of the first user message as title
      return firstAIMessage.title;
    }
    return "Untitled Chat";
  }

  const createSocketConnection = () => {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${location.host}/secure/chat/ws`;
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    };


    socketRef.current.onmessage = (event) => {
      setIsTyping(false);
      let data = JSON.parse(event.data);
      if (typeof data === "string") data = JSON.parse(data);

      const chatId = data.thread_id;
      const title = data.title;
      if (!chatId) return;

      setMessagesByChat(prev => {
        const chatMessages = prev[chatId]?.messages || [];

        if (data.type === "stream") {
          const chunk = data.content;

          if (chunk === "__END__") {
            console.log("--chat is ending----", title, prev[chatId].title)

            return {
              ...prev,
              [chatId]:
              {
                ...prev[chatId], title: prev[chatId].title ? prev[chatId].title : title, messages: chatMessages.map((m, i) =>
                  i === chatMessages.length - 1 ? { ...m, streaming: false } : m
                )
              }
            };
          }
          if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].streaming) {
            const updated = [...chatMessages];
            updated[updated.length - 1].content += chunk;
            return { ...prev, [chatId]: { ...prev[chatId], messages: updated } };
          }

          return {
            ...prev,
            [chatId]: {
              ...prev[chatId], messages: [
                ...chatMessages,
                {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: chunk,
                  streaming: true,
                  timestamp: new Date(),
                  title: title
                }
              ]
            }
          };
        }

        if (data.type === "source") {
          const updated = [...chatMessages];
          if (updated.length > 0) {
            updated[updated.length - 1].sources = data.sources;
          }
          return { ...prev, [chatId]: updated };
        }

        return prev;
      });
    };
  }

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, sendMessage, isTyping, isConnected, messagesByChat, createSocketConnection, hydrateChatMessages, insertChatMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
