
import Replicate from "https://esm.sh/replicate@0.25.2";

// Generate a custom prompt using OpenAI
export async function generateCustomPrompt(goalTitle: string, OPENAI_API_KEY: string) {
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
export async function generateImage(imagePrompt: string, REPLICATE_API_KEY: string) {
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
        num_inference_steps: 4  // Limit to 4 as required by the model
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
export async function validateImageUrl(imageUrl: string) {
  try {
    // Set a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const imageResponse = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
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
