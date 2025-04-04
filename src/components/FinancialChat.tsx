import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ChatThreadList from "@/components/chat/ChatThreadList";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
export function FinancialChat() {
  const [isThreadsOpen, setIsThreadsOpen] = useState(false);
  const {
    messages,
    threads,
    threadId,
    isLoading,
    error,
    currentUserId,
    messageLimitReached,
    createThread,
    sendMessage,
    selectThread
  } = useChat();
  const handleToggleThreads = () => {
    setIsThreadsOpen(!isThreadsOpen);
  };
  const handleCreateThread = async () => {
    await createThread("New Chat");
  };
  const handleSendMessage = async (content: string) => {
    if (!threadId) {
      await handleCreateThread();
    }
    await sendMessage(content);
  };
  return <div className="flex flex-col h-[calc(80vh-120px)] rounded-md overflow-hidden border border-gray-200">
      <div className="bg-white shadow-sm p-4 rounded-t-md flex justify-between items-center">
        <h2 className="text-lg font-medium">Financial AI Assistant</h2>
        <button onClick={handleToggleThreads} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
          <MessageSquare size={16} />
          <span>History</span>
        </button>
      </div>

      {messageLimitReached && <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              You've reached your daily message limit on your current plan.
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>}

      <div className="flex flex-1 overflow-hidden">
        <ChatThreadList threads={threads} activeThreadId={threadId} onSelectThread={selectThread} onCreateThread={handleCreateThread} isOpen={isThreadsOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {!threadId && threads.length === 0 && <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <p className="text-gray-500 mb-4 text-center">
                You don't have any chats yet. Start a new conversation by clicking the button below
                or typing your question in the chat box.
              </p>
              <Button onClick={handleCreateThread} className="flex items-center gap-2">
                <Plus size={16} />
                Create New Chat
              </Button>
            </div>}
          
          <ChatMessageList messages={messages} currentUserId={currentUserId} isLoading={isLoading} threadId={threadId} error={error} />
          
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isDisabled={messageLimitReached} placeholder="Ask a financial question..." />
        </div>
      </div>
    </div>;
}
;
export default FinancialChat;