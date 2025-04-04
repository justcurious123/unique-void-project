
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatThread } from "@/types/chat";

interface ChatThreadListProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  isOpen: boolean;
}

const ChatThreadList = ({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  isOpen
}: ChatThreadListProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="w-64 h-full border-r border-gray-200 bg-white p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chats</h3>
        <Button 
          onClick={onCreateThread} 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          title="New Chat"
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col space-y-2">
          {threads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center p-4">
              No chats yet. Create your first chat to get started.
            </p>
          ) : (
            threads.map(thread => (
              <Button 
                key={thread.id} 
                variant={thread.id === activeThreadId ? "default" : "ghost"} 
                className="justify-start text-left w-full h-auto py-2" 
                onClick={() => onSelectThread(thread.id)}
              >
                <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">{thread.title}</span>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatThreadList;
