
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const { goalTitle, goalId } = await req.json();

    if (!goalTitle || !goalId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: goalTitle and goalId are required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Generating image for goal: "${goalTitle}" (ID: ${goalId})`);
    
    // Generate a custom prompt using OpenAI
    console.log("Generating custom prompt with OpenAI");
    const promptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a prompt generator for an image generation AI. Create a short, descriptive prompt for an image that represents the given concept. Focus on the concrete object or concept, not the financial aspect. The prompt should be for a beautiful, inspirational image with professional quality, vibrant colors, and realism. Do not include text in the image. Just return the prompt, nothing else.'
          },
          {
            role: 'user',
            content: `Generate an image prompt for: ${goalTitle}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const promptData = await promptResponse.json();
    const imagePrompt = promptData.choices[0].message.content.trim();
    
    console.log(`Generated custom prompt: "${imagePrompt}"`);
    
    // Use the custom prompt for image generation
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: imagePrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "16:9", // Changed to 16:9 for better card display
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    console.log("Image generated successfully:", output);
    
    // Update the goal with the image URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ 
          output,
          warning: "Image URL not saved to database due to missing configuration" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabase
      .from('goals')
      .update({ image_url: output[0] })
      .eq('id', goalId);
      
    if (updateError) {
      console.error("Error updating goal with image URL:", updateError);
      return new Response(
        JSON.stringify({ 
          output,
          warning: "Image generated but not saved to database",
          error: updateError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        output,
        message: "Image generated and saved to goal record",
        prompt: imagePrompt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in generate-goal-image function:", error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
