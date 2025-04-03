
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLimits } from "@/hooks/useLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { ChatMessage, ChatThread } from "@/types/chat";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { usageData } = useSubscription();
  const { messageLimitReached } = useLimits(usageData);

  // Get current user ID
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error);
          return;
        }
        setCurrentUserId(data.user?.id || null);
      } catch (err) {
        console.error("Unexpected error getting user:", err);
      }
    }
    getCurrentUser();
  }, []);

  // Fetch threads
  useEffect(() => {
    fetchThreads();
  }, []);

  // Fetch messages when thread changes
  useEffect(() => {
    if (!threadId) return;
    fetchMessages();

    // Subscribe to new messages
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
  }, [threadId]);

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
        return;
      }
      
      setThreads(data || []);
      
      // If there are threads but no active thread, set the first one as active
      if (data?.length && !threadId) {
        setThreadId(data[0].id);
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

  const fetchMessages = async () => {
    if (!threadId) return;
    
    setIsLoading(true);
    setError(null);
    
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
        return;
      }
      
      setMessages(data || []);
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

  const createThread = async (title: string) => {
    if (!title || typeof title !== 'string') {
      toast({
        title: "Invalid title",
        description: "Please provide a valid title for the chat",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Not authenticated",
          description: "Please login to create a chat",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("chat_threads")
        .insert([{ title, user_id: session.session.user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating thread:", error);
        toast({
          title: "Error creating chat",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      await fetchThreads(); // Refresh the threads list
      setThreadId(data.id);
      
      toast({
        title: "Chat created",
        description: "New chat created successfully",
      });
      
      return data.id;
    } catch (error: any) {
      console.error("Unexpected error creating thread:", error);
      toast({
        title: "Unexpected error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // If no thread exists, create one first
    let threadIdToUse = threadId;
    if (!threadIdToUse) {
      threadIdToUse = await createThread("New Chat");
      if (!threadIdToUse) return; // Failed to create thread
    }
    
    if (messageLimitReached) {
      toast({
        title: "Message limit reached",
        description: "You've reached your daily message limit. Please upgrade your plan to continue chatting.",
        variant: "destructive"
      });
      return;
    }
    
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

      // Save user message
      const { error: userMsgError } = await supabase
        .from("chat_messages")
        .insert([
          {
            thread_id: threadIdToUse,
            sender: session.session.user.id,
            content: content,
          },
        ]);

      if (userMsgError) {
        console.error("Error sending message:", userMsgError);
        setError(userMsgError.message);
        toast({
          title: "Error sending message",
          description: userMsgError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Generate AI response
      try {
        // Call OpenAI to generate a response
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('financial-advice', {
          body: { question: content, threadId: threadIdToUse }
        });
        
        if (aiError) throw aiError;
        
        // Save AI response to the database
        if (aiResponse?.answer) {
          await supabase
            .from("chat_messages")
            .insert([
              {
                thread_id: threadIdToUse,
                sender: "ai",
                content: aiResponse.answer,
              },
            ]);
        }
        
      } catch (aiError: any) {
        console.error("Error generating AI response:", aiError);
        toast({
          title: "Error from AI",
          description: "Could not generate AI response. Try again later.",
          variant: "destructive"
        });
      }
      
      setError(null);
      
      // Increment usage counter
      try {
        await supabase.rpc('increment_usage', { usage_type: 'message' });
      } catch (error) {
        console.error("Failed to track message usage:", error);
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
  };

  const selectThread = (id: string) => {
    setThreadId(id);
  };

  return {
    messages,
    threads,
    threadId,
    isLoading,
    error,
    currentUserId,
    messageLimitReached,
    fetchThreads,
    fetchMessages,
    createThread,
    sendMessage,
    selectThread
  };
};
