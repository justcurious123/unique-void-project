
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

// Validate API keys and environment
function validateEnvironment() {
  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY is not set');
  }
  
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  return {
    REPLICATE_API_KEY,
    OPENAI_API_KEY
  };
}

// Validate request data
function validateRequestData(data: any) {
  const { goalTitle, goalId } = data;

  if (!goalTitle || !goalId) {
    throw new Error("Missing required fields: goalTitle and goalId are required");
  }

  return { goalTitle, goalId };
}

// Generate a custom prompt using OpenAI
async function generateCustomPrompt(goalTitle: string, OPENAI_API_KEY: string) {
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
  if (!promptData.choices || !promptData.choices[0]) {
    console.error("Failed to generate prompt:", promptData);
    throw new Error("Failed to generate prompt with OpenAI");
  }
  
  const imagePrompt = promptData.choices[0].message.content.trim();
  console.log(`Generated custom prompt: "${imagePrompt}"`);
  
  return imagePrompt;
}

// Generate image using Replicate
async function generateImage(imagePrompt: string, REPLICATE_API_KEY: string) {
  console.log("Starting image generation with Replicate");
  
  const replicate = new Replicate({
    auth: REPLICATE_API_KEY,
  });
  
  const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    {
      input: {
        prompt: imagePrompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: "16:9",
        output_format: "webp",
        output_quality: 90,
        num_inference_steps: 4
      }
    }
  );

  if (!output || !output[0]) {
    console.error("No output from Replicate:", output);
    throw new Error("Failed to generate image with Replicate");
  }

  console.log("Image generated successfully:", output);
  
  // Validate image URL
  const imageUrl = output[0];
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
    console.error("Invalid image URL format:", imageUrl);
    throw new Error("Invalid image URL format returned from Replicate");
  }
  
  return imageUrl;
}

// Test that the image is accessible
async function validateImageUrl(imageUrl: string) {
  try {
    const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (!imageResponse.ok) {
      console.error(`Image URL returned ${imageResponse.status} status`);
      throw new Error(`Image URL returned ${imageResponse.status} status`);
    }
    console.log(`Successfully validated image URL: ${imageUrl}`);
    return true;
  } catch (imgError) {
    console.error("Error checking image URL:", imgError);
    // Continue despite error - we'll still try to save the URL
    return false;
  }
}

// Update goal with image URL in Supabase
async function updateGoalWithImage(goalId: string, imageUrl: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error: updateError } = await supabase
    .from('goals')
    .update({ 
      image_url: imageUrl,
      image_loading: false  // Mark loading as complete
    })
    .eq('id', goalId);
    
  if (updateError) {
    throw new Error(`Error updating goal with image URL: ${updateError.message}`);
  }
  
  console.log(`Successfully updated goal ${goalId} with image URL: ${imageUrl}`);
}

// Get a default image when generation fails
function getDefaultImage(goalTitle: string) {
  const placeholderImages = [
    '/lovable-uploads/19dbdc4d-6f26-4be2-95de-ffad330185cf.png',
    '/lovable-uploads/25ef78c0-6845-44e0-8fe7-7e3795460ac6.png',
    '/lovable-uploads/794bb800-0d12-445d-83b9-10952f411ef2.png',
    '/lovable-uploads/8391d5e3-8af0-4054-8443-a805fa03a3df.png',
    '/lovable-uploads/b4f113f2-c30a-406a-ac22-34858aa1f8e0.png',
    '/lovable-uploads/d00efb74-7bb7-4d86-9d48-9c3ad740ffdc.png',
    '/lovable-uploads/e469a406-0cc2-4a24-a75c-353e5c1de348.png',
    '/lovable-uploads/fac4e548-adc3-4344-8961-1c61018e4f57.png',
  ];
  
  // Select a placeholder based on goal title (deterministic)
  let hash = 0;
  for (let i = 0; i < goalTitle.length; i++) {
    hash = ((hash << 5) - hash) + goalTitle.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash);
  return placeholderImages[positiveHash % placeholderImages.length];
}

// Set fallback image when generation fails
async function setFallbackImage(goalId: string, goalTitle: string) {
  try {
    const defaultImageUrl = getDefaultImage(goalTitle);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('goals')
        .update({ 
          image_url: defaultImageUrl,
          image_loading: false  // Mark loading as complete
        })
        .eq('id', goalId);
        
      console.log(`Set fallback image for goal ${goalId}: ${defaultImageUrl}`);
    }
    
    return defaultImageUrl;
  } catch (finalError) {
    console.error("Failed to set fallback image:", finalError);
    throw finalError;
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate environment
    const { REPLICATE_API_KEY, OPENAI_API_KEY } = validateEnvironment();

    // Parse and validate request data
    const data = await req.json();
    const { goalTitle, goalId } = validateRequestData(data);

    console.log(`Generating image for goal: "${goalTitle}" (ID: ${goalId})`);
    
    try {
      // Generate custom prompt
      const imagePrompt = await generateCustomPrompt(goalTitle, OPENAI_API_KEY);
      
      // Generate image with Replicate
      const imageUrl = await generateImage(imagePrompt, REPLICATE_API_KEY);
      
      // Validate the image URL
      const isValid = await validateImageUrl(imageUrl);
      
      if (!isValid) {
        console.warn("Image URL validation failed, but continuing anyway");
      }
      
      // Update the goal with the image URL
      await updateGoalWithImage(goalId, imageUrl);
      
      // Log the success
      console.log(`Goal image generated: ${imageUrl}`);
      console.log(`Using custom prompt: ${imagePrompt}`);

      return new Response(
        JSON.stringify({ 
          output: imageUrl,
          message: "Image generated and saved to goal record",
          prompt: imagePrompt
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (openaiOrReplicateError) {
      console.error("Error during image generation:", openaiOrReplicateError);
      
      // Use fallback image
      const defaultImageUrl = await setFallbackImage(goalId, goalTitle);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate image, fallback image assigned", 
          details: openaiOrReplicateError.message,
          fallback_image: defaultImageUrl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 since we recovered with a fallback
        }
      );
    }
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
