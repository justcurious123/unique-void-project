
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLimits } from "@/hooks/useLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { ChatMessage, ChatThread } from "@/types/chat";

// Helper function to extract a title from the AI response
const extractTitleFromAIResponse = (aiResponse: string): string => {
  // Use the first line or sentence as the title, limiting to 30 characters
  let title = aiResponse.split(/[.!?]|\n/)[0].trim();
  
  // Remove any markdown formatting
  title = title.replace(/[#*]/g, '');
  
  // Limit title length
  if (title.length > 30) {
    title = title.substring(0, 27) + '...';
  }
  
  return title || "New Chat";
};

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
            
            // If this is an AI response and there's only one user message before it,
            // update the thread title based on the AI response
            if (payload.new.sender === "ai") {
              checkAndUpdateThreadTitle(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [threadId]);
  
  // Function to check and update thread title based on AI response
  const checkAndUpdateThreadTitle = async (aiMessage: ChatMessage) => {
    if (!threadId) return;
    
    try {
      // Get all messages in the thread to see if this is the first AI response
      const { data: threadMessages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Find the current thread
      const { data: currentThread } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("id", threadId)
        .single();
      
      // Check if this thread title is "New Chat" and this is the first AI response
      if (
        currentThread?.title === "New Chat" && 
        threadMessages?.filter(msg => msg.sender === "ai").length === 1
      ) {
        const newTitle = extractTitleFromAIResponse(aiMessage.content);
        
        // Update the thread title
        await supabase
          .from("chat_threads")
          .update({ title: newTitle })
          .eq("id", threadId);
          
        // Update local state  
        setThreads(prevThreads => 
          prevThreads.map(thread => 
            thread.id === threadId ? { ...thread, title: newTitle } : thread
          )
        );
      }
    } catch (err) {
      console.error("Error updating thread title:", err);
    }
  };

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
        // Call the financial-advice edge function
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('financial-advice', {
          body: { message: content, threadId: threadIdToUse }
        });
        
        if (aiError) throw aiError;
        
        // Save AI response to the database - FIX: using text property instead of answer
        if (aiResponse?.text) {
          await supabase
            .from("chat_messages")
            .insert([
              {
                thread_id: threadIdToUse,
                sender: "ai",
                content: aiResponse.text,
              },
            ]);
        } else {
          console.error("No AI response text received:", aiResponse);
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
