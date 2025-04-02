
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useLimits } from "@/hooks/useLimits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUp, AlertCircle, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ChatMessage {
  id: string;
  created_at: string;
  sender: string;
  content: string;
}

interface ChatThread {
  id: string;
  created_at: string;
  title: string;
}

export function FinancialChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isThreadsOpen, setIsThreadsOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { usageData, isLoading: isLoadingSubscription } = useSubscription();
  const { messageLimitReached } = useLimits(usageData);
  
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_threads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching threads:", error);
          toast({
            title: "Error fetching chats",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setThreads(data || []);
        }
      } catch (error: any) {
        console.error("Unexpected error fetching threads:", error);
        toast({
          title: "Unexpected error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchThreads();
  }, []);

  useEffect(() => {
    if (!threadId) return;

    setIsLoading(true);
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          setError(error.message);
          toast({
            title: "Error fetching messages",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setMessages(data || []);
        }
      } catch (error: any) {
        console.error("Unexpected error fetching messages:", error);
        setError(error.message || "An unexpected error occurred");
        toast({
          title: "Unexpected error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    const messageSubscription = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        (payload: any) => {
          if (payload.new && payload.new.thread_id === threadId) {
            setMessages((prevMessages) => [...prevMessages, payload.new as ChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [threadId, toast]);

  const handleCreateThread = async () => {
    const title = prompt("Enter a title for the new chat:");
    if (!title) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Not authenticated",
          description: "Please login to create a chat",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("chat_threads")
        .insert([{ title: title, user_id: session.session.user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating thread:", error);
        toast({
          title: "Error creating chat",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setThreads((prevThreads) => [data, ...prevThreads]);
        setThreadId(data.id);
        toast({
          title: "Chat created",
          description: "New chat created successfully",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error creating thread:", error);
      toast({
        title: "Unexpected error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSelectThread = (id: string) => {
    setThreadId(id);
    setIsThreadsOpen(false);
  };

  const handleToggleThreads = () => {
    setIsThreadsOpen(!isThreadsOpen);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageLimitReached) {
      toast({
        title: "Message limit reached",
        description: "You've reached your daily message limit. Please upgrade your plan to continue chatting.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newMessage.trim() || !threadId) return;

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Not authenticated",
          description: "Please login to send a message",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            thread_id: threadId,
            sender: session.session.user.id,
            content: newMessage,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        setError(error.message);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setNewMessage("");
        setError(null);
        scrollToBottom();
      }
    } catch (error: any) {
      console.error("Unexpected error sending message:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Unexpected error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    
    try {
      // After successfully sending a message, increment usage counter
      // We need to call the function directly via RPC since it's defined in the database
      await supabase.rpc('increment_usage', { usage_type: 'message' });
    } catch (error) {
      console.error("Failed to track message usage:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(80vh-120px)] rounded-md overflow-hidden">
      <div className="bg-white shadow-sm p-4 rounded-t-md flex justify-between items-center">
        <h2 className="text-lg font-medium">Financial AI Assistant</h2>
        <button
          onClick={handleToggleThreads}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <MessageSquare size={16} />
          <span>Chats</span>
        </button>
      </div>

      {messageLimitReached && (
        <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              You've reached your daily message limit on your current plan.
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Sheet open={isThreadsOpen} onOpenChange={setIsThreadsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost">Open</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-sm">
          <h3 className="text-lg font-semibold mb-4">Chats</h3>
          <Button variant="outline" onClick={handleCreateThread} className="mb-4 w-full">
            New Chat
          </Button>
          <div className="flex flex-col space-y-2">
            {threads.map((thread) => (
              <Button
                key={thread.id}
                variant="ghost"
                className="justify-start"
                onClick={() => handleSelectThread(thread.id)}
              >
                {thread.title}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading && <div className="text-center">Loading messages...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {!threadId && (
          <div className="text-gray-500 text-center">
            Select a chat to start messaging.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 rounded-md px-3 py-2 w-fit max-w-[75%] ${
              msg.sender === (supabase.auth.getUser())?.data?.user?.id
                ? "bg-blue-100 ml-auto"
                : "bg-gray-100"
            }`}
          >
            <div className="text-sm">{msg.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>
      
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-white border-t border-gray-200 flex items-center space-x-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask a financial question..."
          className="flex-1 py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          disabled={isLoading || !threadId || messageLimitReached}
        />
        <Button
          type="submit" 
          size="icon"
          disabled={!newMessage.trim() || isLoading || !threadId || messageLimitReached}
          className="h-9 w-9"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default FinancialChat;
