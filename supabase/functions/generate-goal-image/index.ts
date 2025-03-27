
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Import utility modules
import { corsHeaders, handleCors } from "./corsUtils.ts";
import { validateEnvironment, validateRequestData } from "./validationUtils.ts";
import { generateCustomPrompt, generateImage, validateImageUrl } from "./imageGenerationUtils.ts";
import { updateGoalWithImage, setFallbackImage, getDefaultImage } from "./databaseUtils.ts";

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
