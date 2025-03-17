
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { message, conciseMode } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    if (!message) {
      throw new Error("No message provided");
    }

    console.log(`Processing financial advice request: ${message}`);
    console.log(`Concise mode: ${conciseMode ? 'enabled' : 'disabled'}`);

    // Prepare system prompt based on conciseMode
    let systemPrompt = `You are a helpful financial advisor chatbot. Provide educational, accurate, and actionable advice on personal finance topics.`;
    
    if (conciseMode) {
      systemPrompt += ` Keep your responses concise, direct, and to-the-point, focusing on actionable steps.`;
    } else {
      systemPrompt += ` You can be more detailed in your explanations, providing context and educational information.`;
    }
    
    // Add instruction to format response using markdown
    systemPrompt += ` Format your responses using markdown for better readability. Use **bold** for important points, *italics* for emphasis, bullet points for lists, and ### for section headers when appropriate.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          },
          { 
            role: "user", 
            content: message 
          }
        ],
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
