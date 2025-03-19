
import React, { useState } from "react";
import { Plus, MessageSquare, Trash2, PenSquare } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Define our own types instead of relying on the generated types
export type ChatThread = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

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
  const [newTitle, setNewTitle] = useState("");
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

  const handleRenameThread = async () => {
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
      setNewTitle("");
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

  const startEditingThread = (thread: ChatThread) => {
    setEditingThread(thread);
    setNewTitle(thread.title);
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
                  <div 
                    key={thread.id}
                    className={`group rounded-lg flex items-center cursor-pointer transition-colors ${
                      thread.id === activeThreadId 
                        ? "bg-blue-500 text-white" 
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => onThreadSelect(thread.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden p-3 flex-grow min-w-0">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm">{thread.title}</span>
                    </div>
                    
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center ${
                      thread.id === activeThreadId ? "text-white" : ""
                    }`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-5 w-5 p-0 min-w-0 rounded-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingThread(thread);
                        }}
                      >
                        <PenSquare className="h-2.5 w-2.5" />
                        <span className="sr-only">Rename</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-5 w-5 p-0 min-w-0 rounded-full mr-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThread(thread.id);
                        }}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <Dialog open={!!editingThread} onOpenChange={(open) => !open && setEditingThread(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Chat Thread</DialogTitle>
              <DialogDescription>Enter a new title for this chat thread.</DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter a new title"
                className="w-full"
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleRenameThread}
                disabled={!newTitle.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default ChatThreadsSheet;
