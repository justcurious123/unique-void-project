
// Utility functions for handling goal images

// Default goal images based on common financial goals
export const DEFAULT_IMAGES = [
  '/lovable-uploads/19dbdc4d-6f26-4be2-95de-ffad330185cf.png',
  '/lovable-uploads/25ef78c0-6845-44e0-8fe7-7e3795460ac6.png',
  '/lovable-uploads/794bb800-0d12-445d-83b9-10952f411ef2.png',
  '/lovable-uploads/8391d5e3-8af0-4054-8443-a805fa03a3df.png',
  '/lovable-uploads/b4f113f2-c30a-406a-ac22-34858aa1f8e0.png',
  '/lovable-uploads/d00efb74-7bb7-4d86-9d48-9c3ad740ffdc.png',
  '/lovable-uploads/e469a406-0cc2-4a24-a75c-353e5c1de348.png',
  '/lovable-uploads/fac4e548-adc3-4344-8961-1c61018e4f57.png',
];

// Get a deterministic but random-seeming default image based on the goal title
export const getDefaultImage = (goalTitle: string): string => {
  // Create a simple hash of the title
  let hash = 0;
  for (let i = 0; i < goalTitle.length; i++) {
    hash = ((hash << 5) - hash) + goalTitle.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Get a positive index
  const positiveHash = Math.abs(hash);
  // Use the hash to select an image from the array
  return DEFAULT_IMAGES[positiveHash % DEFAULT_IMAGES.length];
};

export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    // Skip validation for local and Supabase storage images
    if (
      url.startsWith('/lovable-uploads/') || 
      url.includes('.supabase.co/storage/v1/object/public/goal_images/')
    ) {
      return true;
    }
    
    // For remote URLs, use a proper HEAD request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if this is an image content type
    const contentType = response.headers.get('content-type');
    const isImage = contentType && contentType.startsWith('image/');
    
    return response.ok && isImage;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
};

// Preload goal image with extended support for storage URLs
export const preloadGoalImage = (
  goal: { id: string; title: string; image_url?: string },
  onSuccess: (goalId: string) => void,
  onError: (goalId: string, defaultImage: string) => void
) => {
  if (!goal.image_url) {
    const defaultImg = getDefaultImage(goal.title);
    onError(goal.id, defaultImg);
    return;
  }

  // For local or Supabase storage images, don't try to preload
  if (
    goal.image_url.startsWith('/lovable-uploads/') || 
    goal.image_url.includes('.supabase.co/storage/v1/object/public/goal_images/')
  ) {
    onSuccess(goal.id);
    return;
  }

  // For remote URLs, set a timeout to avoid hanging
  const img = new Image();
  const timeoutId = setTimeout(() => {
    console.log(`Image load timeout for goal: ${goal.id}`);
    const defaultImg = getDefaultImage(goal.title);
    onError(goal.id, defaultImg);
  }, 5000); // 5 second timeout
  
  img.onload = () => {
    clearTimeout(timeoutId);
    console.log(`Image loaded successfully for goal: ${goal.id}`);
    onSuccess(goal.id);
  };
  
  img.onerror = () => {
    clearTimeout(timeoutId);
    console.error(`Failed to load image for goal: ${goal.title}`);
    const defaultImg = getDefaultImage(goal.title);
    onError(goal.id, defaultImg);
  };

  // Set the source to trigger the loading
  img.src = goal.image_url;
};

// Apply image properties to goals with extended storage support
export const applyImagePropertiesToGoals = (goals: any[]) => {
  return goals.map(goal => {
    let imageUrl = goal.image_url;
    
    // If no image_url, assign a default
    if (!imageUrl) {
      imageUrl = getDefaultImage(goal.title);
    }
    
    // For local images or Supabase storage, mark as non-loading
    const isLocalOrStorageImage = 
      imageUrl.startsWith('/lovable-uploads/') || 
      imageUrl.includes('.supabase.co/storage/v1/object/public/goal_images/');
    
    return {
      ...goal,
      image_url: imageUrl,
      image_loading: !isLocalOrStorageImage, // Only set loading true for non-local images
      image_error: false
    };
  });
};
