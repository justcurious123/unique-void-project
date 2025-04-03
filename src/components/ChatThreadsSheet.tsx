
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatThread } from "@/types/chat";
import ThreadItem from "@/components/chat/thread/ThreadItem";
import RenameThreadDialog from "@/components/chat/thread/RenameThreadDialog";

interface ChatThreadsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onCreateNewThread: () => void;
  onThreadsUpdate: () => void;
}

const ChatThreadsSheet: React.FC<ChatThreadsSheetProps> = ({
  open,
  onOpenChange,
  threads,
  activeThreadId,
  onThreadSelect,
  onCreateNewThread,
  onThreadsUpdate
}) => {
  const { toast } = useToast();
  const [editingThread, setEditingThread] = useState<ChatThread | null>(null);
  const isMobile = useIsMobile();

  const handleDeleteThread = async (threadId: string) => {
    try {
      // Delete all messages in the thread
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('thread_id', threadId);
      
      if (messagesError) throw messagesError;
      
      // Delete the thread
      const { error: threadError } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', threadId);
      
      if (threadError) throw threadError;
      
      toast({
        title: "Thread deleted",
        description: "The chat thread has been deleted successfully."
      });
      
      onThreadsUpdate();
      
      // If the active thread is deleted, create a new one
      if (threadId === activeThreadId) {
        onCreateNewThread();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the thread. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting thread:", error);
    }
  };

  const handleRenameThread = async (newTitle: string) => {
    if (!editingThread || !newTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('chat_threads')
        .update({ title: newTitle.trim(), updated_at: new Date().toISOString() })
        .eq('id', editingThread.id);
      
      if (error) throw error;
      
      toast({
        title: "Thread renamed",
        description: "The chat thread has been renamed successfully."
      });
      
      setEditingThread(null);
      onThreadsUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename the thread. Please try again.",
        variant: "destructive"
      });
      console.error("Error renaming thread:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 pt-10 w-[300px] sm:w-[350px]">
        <SheetHeader className="px-4 mb-2">
          <SheetTitle className="text-xl text-left">Chat History</SheetTitle>
        </SheetHeader>
        
        <div className="px-4 pb-4">
          <Button 
            onClick={onCreateNewThread} 
            className="w-full rounded-lg flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
          
          <ScrollArea className="h-[calc(100vh-140px)] mt-4">
            {threads.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No chat threads yet</p>
                <p className="text-sm">Create a new chat to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === activeThreadId}
                    onSelect={onThreadSelect}
                    onDelete={handleDeleteThread}
                    onEdit={setEditingThread}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <RenameThreadDialog
          thread={editingThread}
          isOpen={!!editingThread}
          onOpenChange={(open) => !open && setEditingThread(null)}
          onRename={handleRenameThread}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatThreadsSheet;
