
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Import utility modules
import { corsHeaders, handleCors } from "./corsUtils.ts";
import { validateEnvironment, validateRequestData } from "./validationUtils.ts";
import { generateCustomPrompt, generateImage, validateImageUrl } from "./imageGenerationUtils.ts";
import { updateGoalWithImage, setFallbackImage, getDefaultImage } from "./databaseUtils.ts";

// Function to download and upload image to Supabase storage
async function uploadImageToStorage(imageUrl: string, goalTitle: string, goalId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  
  // Generate a unique filename
  const filename = `goal_${goalId}_${Date.now()}.webp`;
  
  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('goal_images')
    .upload(filename, imageBlob, {
      contentType: 'image/webp',
      upsert: true
    });
  
  if (error) {
    console.error("Error uploading image to storage:", error);
    throw error;
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('goal_images')
    .getPublicUrl(filename);
  
  return publicUrlData.publicUrl;
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
      
      // Download and upload image to Supabase storage
      const storedImageUrl = await uploadImageToStorage(imageUrl, goalTitle, goalId);
      
      // Update the goal with the Supabase storage URL
      await updateGoalWithImage(goalId, storedImageUrl);
      
      // Log the success
      console.log(`Goal image generated and stored: ${storedImageUrl}`);
      console.log(`Using custom prompt: ${imagePrompt}`);

      return new Response(
        JSON.stringify({ 
          output: storedImageUrl,
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
