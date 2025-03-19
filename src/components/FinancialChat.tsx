
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

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

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
        
        setThreads(data as ChatThread[] || []);
        
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
        
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender as "user" | "ai",
          timestamp: new Date(msg.created_at),
        }));
        
        if (formattedMessages.length === 0 && isNewThread) {
          const welcomeMessage: Message = {
            id: "welcome",
            text: "Hello! I'm your financial assistant. Ask me any questions about managing money, investing, saving, or planning for your financial future.",
            sender: "ai",
            timestamp: new Date(),
          };
          
          setMessages([welcomeMessage]);
          
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
        const processedMessageIds = new Set(messages.map(msg => msg.id));
        
        if (!processedMessageIds.has(payload.new.id)) {
          const newMessage: Message = {
            id: payload.new.id,
            text: payload.new.content,
            sender: payload.new.sender,
            timestamp: new Date(payload.new.created_at),
          };
          
          setMessages(prev => [...prev, newMessage]);
          processedMessageIds.add(payload.new.id);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThreadId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewThread = async () => {
    if (!userId) return;
    
    try {
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

  const loadThreads = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setThreads(data as ChatThread[] || []);
    } catch (error) {
      console.error("Error loading chat threads:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const updateThreadTitle = async (threadId: string, message: string) => {
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
      
      loadThreads();
    } catch (error) {
      console.error("Error updating thread title:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !activeThreadId) return;
    
    const userMessageText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    
    try {
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        text: userMessageText,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      const { data: msgData, error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeThreadId,
          content: userMessageText,
          sender: "user",
        })
        .select()
        .single();
      
      if (msgError) throw msgError;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId 
            ? {
                id: msgData.id,
                text: msgData.content,
                sender: msgData.sender as "user" | "ai",
                timestamp: new Date(msgData.created_at),
              }
            : msg
        )
      );
      
      const isFirstMessage = messages.filter(m => m.sender === "user").length === 0;
      if (isFirstMessage) {
        await updateThreadTitle(activeThreadId, userMessageText);
      }
      
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeThreadId);
      
      const { data, error } = await supabase.functions.invoke("financial-advice", {
        body: { 
          message: userMessageText,
          threadId: activeThreadId,
          conciseMode: conciseResponses
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to get response");
      }

      await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeThreadId,
          content: data.text,
          sender: "ai",
        });
    } catch (error) {
      console.error("Error getting financial advice:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
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
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsThreadsSheetOpen(true)}
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">Chat History</span>
          </Button>
          <h2 className="text-lg font-semibold">Financial Assistant</h2>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
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
      
      <div className="flex-1 overflow-y-auto mb-2 sm:mb-4 space-y-3 rounded-md bg-white/5 p-2 sm:p-4">
        {isThreadsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-1/2 ml-auto" />
            <Skeleton className="h-10 w-2/3" />
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
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10"
                }`}
              >
                {message.sender === "ai" ? (
                  <div className="whitespace-pre-wrap text-sm leading-snug">
                    {message.text.split('**').map((part, index) => 
                      index % 2 === 0 ? (
                        <span key={index}>{part}</span>
                      ) : (
                        <strong key={index}>{part}</strong>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
                <p className="text-[10px] mt-1 opacity-70">
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
            <div className="max-w-[85%] rounded-lg px-3 py-2 bg-white/10">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-32 mt-2" />
              <Skeleton className="h-3 w-28 mt-1" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {showExamples && messages.length <= 2 && !isLoading && (
        <div className="mb-2 sm:mb-3">
          <p className="text-xs mb-1 text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {exampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
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
          className="flex-1 h-9"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !inputValue.trim() || !activeThreadId}
          size="sm"
          className="h-9 px-3"
        >
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
