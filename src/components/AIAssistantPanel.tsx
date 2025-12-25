import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, Loader2, X, Lightbulb, TrendingUp, Truck, Route, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useAIAssistant } from "@/hooks/useSearch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: any;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { icon: Route, label: "Create a new trip", prompt: "Help me create a new trip from Mumbai to Delhi for construction materials" },
  { icon: TrendingUp, label: "Analyze expenses", prompt: "Analyze my expenses for this month and suggest cost savings" },
  { icon: Truck, label: "Suggest best vehicle", prompt: "Which vehicle should I use for a 500km trip with 10 tons of cargo?" },
  { icon: Lightbulb, label: "Get insights", prompt: "Give me insights on my fleet performance and recommendations" },
];

export function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const aiAssistant = useAIAssistant();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await aiAssistant.mutateAsync({
        message: content,
        action: "chat",
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
      };

      // Try to parse actions from response
      try {
        const actionMatch = response.response.match(/\{[\s\S]*"action"[\s\S]*\}/);
        if (actionMatch) {
          assistantMessage.action = JSON.parse(actionMatch[0]);
        }
      } catch (e) {
        // No action found
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleActionClick = (action: any) => {
    if (action?.action === "create_trip") {
      navigate("/trips");
      toast.info("AI suggested trip details copied. Open Create Trip to apply.");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">FleetPro AI</h2>
              <p className="text-xs text-muted-foreground">Your intelligent assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
                <h3 className="font-semibold mb-2">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground">
                  I can create trips, analyze data, suggest vehicles, and more.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.action && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() => handleActionClick(msg.action)}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Apply Suggestion
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {aiAssistant.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={aiAssistant.isPending}
            />
            <Button type="submit" disabled={aiAssistant.isPending || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
