import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Send, Loader2, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChatThreadsSheet, { ChatThread } from "./ChatThreadsSheet";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const FinancialChat: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conciseResponses, setConciseResponses] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [isNewThread, setIsNewThread] = useState(false);
  const [isThreadsSheetOpen, setIsThreadsSheetOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Load chat threads
  useEffect(() => {
    if (!userId) return;
    
    const loadChatThreads = async () => {
      setIsThreadsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('chat_threads')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setThreads(data || []);
        
        // If there are threads, set the active thread to the most recent one
        // Otherwise, create a new thread
        if (data && data.length > 0) {
          setActiveThreadId(data[0].id);
        } else {
          createNewThread();
        }
      } catch (error) {
        console.error("Error loading chat threads:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
      } finally {
        setIsThreadsLoading(false);
      }
    };
    
    loadChatThreads();
  }, [userId, toast]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeThreadId) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', activeThreadId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Convert Supabase messages to our Message format
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender as "user" | "ai",
          timestamp: new Date(msg.created_at),
        }));
        
        // If it's a new thread, add a welcome message
        if (formattedMessages.length === 0 && isNewThread) {
          const welcomeMessage: Message = {
            id: "welcome",
            text: "Hello! I'm your financial assistant. Ask me any questions about managing money, investing, saving, or planning for your financial future.",
            sender: "ai",
            timestamp: new Date(),
          };
          
          setMessages([welcomeMessage]);
          
          // Save the welcome message to the database
          await supabase
            .from('chat_messages')
            .insert({
              thread_id: activeThreadId,
              content: welcomeMessage.text,
              sender: "ai",
            });
          
          setIsNewThread(false);
        } else {
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [activeThreadId, isNewThread, toast]);

  // Subscribe to new messages
  useEffect(() => {
    if (!activeThreadId) return;
    
    const channel = supabase
      .channel('chat-messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `thread_id=eq.${activeThreadId}`,
      }, (payload) => {
        // Only add the message if it's not already in the messages array
        const existingMessage = messages.find(msg => msg.id === payload.new.id);
        if (!existingMessage) {
          const newMessage: Message = {
            id: payload.new.id,
            text: payload.new.content,
            sender: payload.new.sender,
            timestamp: new Date(payload.new.created_at),
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThreadId, messages]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create a new thread
  const createNewThread = async () => {
    if (!userId) return;
    
    try {
      // Create a default title
      const defaultTitle = `Financial Chat ${new Date().toLocaleDateString()}`;
      
      const { data, error } = await supabase
        .from('chat_threads')
        .insert({
          user_id: userId,
          title: defaultTitle,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setActiveThreadId(data.id);
      setIsNewThread(true);
      
      // Update threads list
      loadThreads();
    } catch (error) {
      console.error("Error creating new thread:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat thread",
        variant: "destructive",
      });
    }
  };

  // Load threads
  const loadThreads = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setThreads(data || []);
    } catch (error) {
      console.error("Error loading chat threads:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  // Update thread title based on first message
  const updateThreadTitle = async (threadId: string, message: string) => {
    // Extract first few words for the title
    const words = message.split(' ');
    const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
    
    try {
      const { error } = await supabase
        .from('chat_threads')
        .update({ 
          title, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', threadId);
      
      if (error) throw error;
      
      // Update threads list
      loadThreads();
    } catch (error) {
      console.error("Error updating thread title:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !activeThreadId) return;
    
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
      // Save user message to database
      const { data: msgData, error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeThreadId,
          content: userMessage.text,
          sender: "user",
        })
        .select()
        .single();
      
      if (msgError) throw msgError;
      
      // Update thread title if it's the first user message
      const isFirstMessage = messages.filter(m => m.sender === "user").length === 0;
      if (isFirstMessage) {
        await updateThreadTitle(activeThreadId, userMessage.text);
      }
      
      // Update thread timestamp
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeThreadId);
      
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
      
      // Save AI message to database
      await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeThreadId,
          content: aiMessage.text,
          sender: "ai",
        });
      
      // Note: We don't need to update messages state here, since we're subscribing to realtime updates
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
      
      // Save error message to database
      await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeThreadId,
          content: errorMessage.text,
          sender: "ai",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setIsThreadsSheetOpen(false);
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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsThreadsSheetOpen(true)}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Chat History</span>
          </Button>
          <h2 className="text-xl font-semibold">Financial Assistant</h2>
        </div>
        
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
        {isThreadsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2 ml-auto" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <MessageSquare className="mx-auto h-8 w-8 opacity-50" />
              <h3 className="font-medium">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Start a conversation to get financial advice</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
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
          ))
        )}
        
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
          disabled={isLoading || !activeThreadId}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim() || !activeThreadId}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <ChatThreadsSheet
        open={isThreadsSheetOpen}
        onOpenChange={setIsThreadsSheetOpen}
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onCreateNewThread={createNewThread}
        onThreadsUpdate={loadThreads}
      />
    </div>
  );
};

export default FinancialChat;
