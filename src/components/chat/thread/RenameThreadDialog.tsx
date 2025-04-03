
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatThread } from "@/types/chat";

interface RenameThreadDialogProps {
  thread: ChatThread | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (title: string) => Promise<void>;
}

const RenameThreadDialog: React.FC<RenameThreadDialogProps> = ({
  thread,
  isOpen,
  onOpenChange,
  onRename
}) => {
  const [newTitle, setNewTitle] = useState(thread?.title || "");

  const handleRename = async () => {
    if (!newTitle.trim()) return;
    await onRename(newTitle);
  };
  
  // Update the title when the thread changes
  React.useEffect(() => {
    if (thread) {
      setNewTitle(thread.title);
    }
  }, [thread]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            autoFocus
          />
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleRename}
            disabled={!newTitle.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameThreadDialog;
