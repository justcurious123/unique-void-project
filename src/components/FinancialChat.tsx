
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Send, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const FinancialChat: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your financial assistant. Ask me any questions about managing money, investing, saving, or planning for your financial future.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conciseResponses, setConciseResponses] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("financial-advice", {
        body: { 
          message: userMessage.text,
          conciseMode: conciseResponses
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to get response");
      }

      // Create AI message from response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting financial advice:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "How should I start investing with a small budget?",
    "What's the best way to pay off my student loans?",
    "How much should I save for an emergency fund?",
    "What are the first steps to creating a budget?",
  ];

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Financial Assistant</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Chat Settings</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="concise-mode" className="text-base">Concise Responses</Label>
                  <p className="text-sm text-muted-foreground">Keep responses brief and to-the-point</p>
                </div>
                <Switch 
                  id="concise-mode" 
                  checked={conciseResponses} 
                  onCheckedChange={setConciseResponses} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-examples" className="text-base">Show Examples</Label>
                  <p className="text-sm text-muted-foreground">Display example questions in the chat</p>
                </div>
                <Switch 
                  id="show-examples" 
                  checked={showExamples} 
                  onCheckedChange={setShowExamples} 
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 rounded-md bg-white/5 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/10"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white/10">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-48 mt-2" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {showExamples && messages.length <= 2 && !isLoading && (
        <div className="mb-4">
          <p className="text-sm mb-2 text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputValue(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your financial goals..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default FinancialChat;
