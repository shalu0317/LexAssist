import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Clock, MessageSquare, Trash2 } from "lucide-react";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock chat history data
  const chatHistory = [
    {
      id: 1,
      title: "Tax Deductions for 2024",
      timestamp: new Date(2024, 9, 25, 14, 30),
      messageCount: 15,
      preview: "What are the eligible tax deductions for freelancers in 2024?",
    },
    {
      id: 2,
      title: "GST Filing Process",
      timestamp: new Date(2024, 9, 24, 10, 15),
      messageCount: 8,
      preview: "Can you explain the GST filing process step by step?",
    },
    {
      id: 3,
      title: "Income Tax Calculation",
      timestamp: new Date(2024, 9, 23, 16, 45),
      messageCount: 12,
      preview: "How is income tax calculated for salaried employees?",
    },
    {
      id: 4,
      title: "Investment Tax Benefits",
      timestamp: new Date(2024, 9, 22, 9, 20),
      messageCount: 20,
      preview: "What are the tax benefits of investing in ELSS funds?",
    },
    {
      id: 5,
      title: "Business Registration",
      timestamp: new Date(2024, 9, 21, 11, 0),
      messageCount: 10,
      preview: "What documents are required for business registration?",
    },
  ];

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const filteredHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your previous conversations
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Chat History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conversations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((chat) => (
              <Card
                key={chat.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{chat.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {chat.preview}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(chat.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{chat.messageCount} messages</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
