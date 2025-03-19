
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId, conciseMode } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    if (!message) {
      throw new Error("No message provided");
    }

    if (!threadId) {
      throw new Error("No thread ID provided");
    }

    console.log(`Processing financial advice request in thread: ${threadId}`);
    console.log(`Concise mode: ${conciseMode ? 'enabled' : 'disabled'}`);

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

    // Fetch conversation history from the database
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('content, sender, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    
    if (historyError) {
      throw new Error(`Failed to fetch chat history: ${historyError.message}`);
    }

    console.log(`Retrieved ${chatHistory.length} previous messages from the conversation`);

    // Prepare system prompt based on conciseMode
    let systemPrompt = `You are a helpful financial advisor chatbot. Provide educational, accurate, and actionable advice on personal finance topics.`;
    
    if (conciseMode) {
      systemPrompt += ` Keep your responses concise, direct, and to-the-point, focusing on actionable steps.`;
    } else {
      systemPrompt += ` You can be more detailed in your explanations, providing context and educational information.`;
    }
    
    systemPrompt += ` Format important points, headings, and key terms with double asterisks like **this** for emphasis. Use numbered lists where appropriate but keep formatting clean and simple. Don't overuse formatting, just highlight the most important parts.`;

    // Convert chat history to OpenAI message format
    const conversationMessages = [
      { 
        role: "system", 
        content: systemPrompt 
      }
    ];

    // Add previous messages to the conversation context
    chatHistory.forEach(msg => {
      conversationMessages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      });
    });

    // Add the current message if it's not already in the history
    // Check if the current message is already in the history
    const isMessageInHistory = chatHistory.some(
      msg => msg.sender === "user" && msg.content === message
    );

    if (!isMessageInHistory) {
      conversationMessages.push({
        role: "user",
        content: message
      });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: conciseMode ? 250 : 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("Received response from OpenAI");
    
    return new Response(
      JSON.stringify({ 
        text: data.choices[0].message.content 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
