import { useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import { LayoutContext } from "./LayoutContext";
import { ChatHistory } from "../components/ChatHistory";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sources, setSources] = useState(null);

  // const toggleSource = () => setIsSourceOpen((prev) => !prev);
  const openSourceWithData = (data) => {
    setSources(data);        // Set source object to display
    setIsSourceOpen((prev) => !prev);   // Ensure sidebar opens
  };

  const openAuthModal = () => {
    setAuthModalOpen(!authModalOpen)
    setIsSourceOpen((prev) => !prev);
  }

  const handleSignOut = async () => {
    const protocol = location.protocol === "https:" ? "https" : "http";
    const url = `${protocol}://${location.host}/user/logout`;

    console.log("--url is ---", url);

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });// Update context immediately
    window.location.href = "/";
  };

  return (
    <LayoutContext.Provider value={{ isSourceOpen, openSourceWithData, openAuthModal, authModalOpen }}>
      <div className="flex h-screen w-full overflow-hidden">


        <main className="flex-1 flex flex-col min-w-0 transition-smooth"
          style={{

          }}
        >
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            onAuthClick={() => setAuthModalOpen(true)}
          />
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              handleSignOut={handleSignOut}
            />

            {/* Content area - children routes render here */}
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>

            <ChatHistory
              isOpen={isSourceOpen}
              sources={sources ?? []}
              onToggle={() => setIsSourceOpen(!isSourceOpen)}
            />

          </div>

        </main>

        <Auth
          open={authModalOpen}
          onOpenChange={() => setAuthModalOpen(!authModalOpen)}
        />

      </div>
    </LayoutContext.Provider>
  );
};

export default MainLayout;
