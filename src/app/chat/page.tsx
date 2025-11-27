"use client";

import { useState, useRef, useEffect } from "react";
import { cloudwiseApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am the CloudWise Assistant. Ask me anything about your EC2 instances, costs, or alarms.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await cloudwiseApi.chatbot(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
        <p className="text-gray-400">Powered by Amazon Bedrock</p>
      </div>

      <Card className="flex-1 bg-gray-900/40 border-white/10 backdrop-blur-md flex flex-col overflow-hidden">
        <CardHeader className="border-b border-white/10 py-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-blue-400" />
            CloudWise Bot
          </CardTitle>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 max-w-[80%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <Avatar
                className={cn(
                  "w-8 h-8",
                  msg.role === "assistant" ? "bg-blue-600" : "bg-purple-600"
                )}
              >
                <AvatarFallback>
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm",
                  msg.role === "assistant"
                    ? "bg-gray-800 text-gray-100 rounded-tl-none"
                    : "bg-blue-600 text-white rounded-tr-none"
                )}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="w-8 h-8 bg-blue-600">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your cloud costs..."
              className="bg-gray-800 border-gray-700 text-white focus-visible:ring-blue-500"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
