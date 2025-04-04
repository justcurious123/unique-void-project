
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/hooks/types/goalTypes";
import { preloadGoalImage, validateImageUrl, getDefaultImage } from "@/utils/goalImages";

/**
 * Updates a goal's image loading state in the database
 */
export const updateGoalImageLoadingState = async (goalId: string, isLoading: boolean): Promise<void> => {
  try {
    const { error: updateError } = await supabase.rpc(
      'update_goal_image_loading',
      { 
        goal_id: goalId,
        is_loading: isLoading 
      }
    );
    
    if (updateError) {
      console.error('Failed to update image_loading state:', updateError);
    }
  } catch (updateError) {
    console.error('Failed to update image_loading state:', updateError);
  }
};

/**
 * Initializes a new goal with image state
 */
export const initializeGoalWithImage = (goalData: any): Goal => {
  // For explicitly local URLs (from our public dir), mark as non-loading
  const isLocalImage = goalData.image_url?.startsWith('/lovable-uploads/');
  
  return {
    ...goalData,
    image_url: goalData.image_url || null,
    image_loading: goalData.image_loading ?? !isLocalImage,
    image_error: false,
    image_refresh: false
  };
};

/**
 * Handles preloading images for a list of goals
 */
export const handleGoalImagesPreloading = (
  goals: Goal[], 
  updateGoalInState: (goalUpdate: Partial<Goal> & { id: string }) => void
): void => {
  // Process each goal for image preloading
  goals.forEach(goal => {
    // Skip goals with local images - they don't need preloading
    if (goal.image_url?.startsWith('/lovable-uploads/')) {
      return;
    }
    
    // For goals with remote URLs, check status
    if (goal.image_url && !goal.image_url.startsWith('/lovable-uploads/')) {
      // Skip already loaded images unless they're marked for refresh
      if (!goal.image_loading && !goal.image_refresh) {
        return;
      }
      
      // For loading goals, check their status
      checkAndUpdateGoalImage(goal.id, goal.image_url, updateGoalInState);
    }
  });
};

/**
 * Simplified function to check and update image status for a goal
 */
export const checkAndUpdateGoalImage = async (
  goalId: string,
  currentImageUrl: string | null,
  updateGoalInState: (goalUpdate: Partial<Goal> & { id: string }) => void
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('image_url, image_loading, title')
      .eq('id', goalId)
      .single();
      
    if (error) {
      console.error(`Error checking goal image: ${error.message}`);
      return false;
    }
    
    if (!data) {
      return false;
    }
    
    const isReplicateImage = data.image_url?.includes('replicate.delivery');
    
    // If it's a Replicate image and database says it's ready
    if (isReplicateImage && data.image_url && !data.image_loading) {
      console.log(`Image ready for goal ${goalId}: ${data.image_url}`);
      
      // Only update if the image URL has changed or was previously loading
      if (data.image_url !== currentImageUrl || data.image_loading) {
        updateGoalInState({
          id: goalId,
          image_url: data.image_url,
          image_loading: false,
          image_refresh: true
        });
      }
      
      return true;
    }
    
    // If it's a local fallback image
    if (data.image_url?.startsWith('/lovable-uploads/')) {
      updateGoalInState({
        id: goalId,
        image_url: data.image_url,
        image_loading: false,
        image_refresh: false
      });
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error in checkAndUpdateGoalImage: ${err}`);
    return false;
  }
};
