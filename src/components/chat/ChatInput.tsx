
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
  placeholder?: string;
}

const ChatInput = ({
  onSendMessage,
  isLoading,
  isDisabled,
  placeholder = "Type a message..."
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 bg-white border-t border-gray-200 flex items-center space-x-2"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        disabled={isLoading || isDisabled}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading || isDisabled}
        className="h-9 w-9"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
