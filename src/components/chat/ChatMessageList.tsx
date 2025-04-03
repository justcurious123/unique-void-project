
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { Spinner } from "@/components/ui/spinner";

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  isLoading: boolean;
  threadId: string | null;
  error: string | null;
}

const ChatMessageList = ({
  messages,
  currentUserId,
  isLoading,
  threadId,
  error
}: ChatMessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {error && <div className="text-red-500 text-center py-3">{error}</div>}
      
      {threadId && messages.length === 0 && !isLoading && (
        <div className="text-gray-500 text-center py-8">
          No messages yet. Start the conversation by typing below.
        </div>
      )}
      
      {!threadId && messages.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          Select a chat or create a new one to start messaging.
        </div>
      )}
      
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-3 rounded-md px-3 py-2 w-fit max-w-[75%] ${
            msg.sender === currentUserId
              ? "bg-blue-100 ml-auto"
              : "bg-gray-100"
          }`}
        >
          <div className="text-sm">{msg.content}</div>
          <div className="text-xs text-gray-500">
            {msg.sender === "ai" ? "AI" : new Date(msg.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex items-center space-x-2 py-2">
          <div className="w-fit bg-gray-100 rounded-md px-3 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">AI is thinking...</span>
              <div className="animate-pulse bg-blue-300 h-2 w-2 rounded-full"></div>
              <div className="animate-pulse delay-75 bg-blue-400 h-2 w-2 rounded-full"></div>
              <div className="animate-pulse delay-150 bg-blue-500 h-2 w-2 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
