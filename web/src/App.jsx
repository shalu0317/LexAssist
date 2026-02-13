import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WebSocketProvider } from "./components/WebSocketProvider";

import { UserProvider } from "@/components/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./AppRoutes";
import { ChatProvider } from "./components/ChatProvider";

const queryClient = new QueryClient();

const clientId =
  "743695190259-e9ednmmrqqus0419886khkemfqpbqhc5.apps.googleusercontent.com";


const App = () => (
  <GoogleOAuthProvider clientId={clientId}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <UserProvider>
          <TooltipProvider>
            <WebSocketProvider>
              <ChatProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes/>
              </BrowserRouter>
              </ChatProvider>
            </WebSocketProvider>
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
