
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Update goal with image URL in Supabase
export async function updateGoalWithImage(goalId: string, imageUrl: string) {
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
export function getDefaultImage(goalTitle: string) {
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
export async function setFallbackImage(goalId: string, goalTitle: string) {
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
