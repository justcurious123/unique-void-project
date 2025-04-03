
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenSquare, Trash2 } from "lucide-react";
import { ChatThread } from "@/types/chat";

interface ThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (thread: ChatThread) => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
  isActive,
  onSelect,
  onDelete,
  onEdit
}) => {
  return (
    <div 
      key={thread.id}
      className={`group rounded-lg flex items-center cursor-pointer transition-colors ${
        isActive 
          ? "bg-blue-500 text-white" 
          : "hover:bg-slate-100"
      }`}
      onClick={() => onSelect(thread.id)}
    >
      <div className="flex items-center gap-2 overflow-hidden p-3 flex-grow min-w-0">
        <MessageSquare className="h-4 w-4 shrink-0" />
        <span className="truncate text-sm">{thread.title}</span>
      </div>
      
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center ${
        isActive ? "text-white" : ""
      }`}>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-5 w-5 p-0 min-w-0 rounded-full" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(thread);
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
            onDelete(thread.id);
          }}
        >
          <Trash2 className="h-2.5 w-2.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
};

export default ThreadItem;
