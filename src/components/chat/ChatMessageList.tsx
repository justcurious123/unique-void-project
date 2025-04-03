
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";

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
      {isLoading && <div className="text-center py-3">Loading messages...</div>}
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
            {new Date(msg.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
