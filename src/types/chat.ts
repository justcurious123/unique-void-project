
export interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id?: string; // Added for completeness
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender: string; // This can be a user ID or "ai"
  content: string;
  created_at: string;
}
