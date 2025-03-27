
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/hooks/types/goalTypes";
import { getDefaultImage } from "@/utils/goalImages";
import { preloadGoalImage, validateImageUrl } from "@/utils/goalImages";

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
  // Assign a default image if none exists
  const imageUrl = goalData.image_url || getDefaultImage(goalData.title);
  
  // For explicitly local URLs (from our public dir), mark as non-loading
  const isLocalImage = imageUrl.startsWith('/lovable-uploads/');
  
  return {
    ...goalData,
    image_url: imageUrl,
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
    
    // For loading goals, check their status
    if (goal.image_loading) {
      checkAndUpdateGoalImage(goal.id, updateGoalInState)
        .then(updated => {
          if (!updated) {
            console.log(`Goal ${goal.id} image still loading`);
          }
        });
    }
    
    // For goals with URLs that should be checked
    if (goal.image_url && !goal.image_url.startsWith('/lovable-uploads/')) {
      // Validate the URL and preload the image
      validateImageUrl(goal.image_url)
        .then(isValid => {
          if (isValid) {
            // Success handler
            const onSuccess = () => {
              updateGoalInState({
                id: goal.id,
                image_loading: false,
                image_error: false
              });
            };
            
            // Error handler
            const onError = (defaultImage: string) => {
              updateGoalInState({
                id: goal.id,
                image_url: defaultImage,
                image_loading: false,
                image_error: true
              });
            };
            
            // Preload the image
            preloadGoalImage(
              goal, 
              () => onSuccess(),
              (_, defaultImg) => onError(defaultImg)
            );
          } else {
            // If URL is invalid, use default image
            const defaultImg = getDefaultImage(goal.title);
            updateGoalInState({
              id: goal.id,
              image_url: defaultImg,
              image_loading: false,
              image_error: true
            });
          }
        });
    }
  });
};

/**
 * Simplified function to check and update image status for a goal
 */
export const checkAndUpdateGoalImage = async (
  goalId: string,
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
      
      updateGoalInState({
        id: goalId,
        image_url: data.image_url,
        image_loading: false,
        image_refresh: true
      });
      
      return true;
    }
    
    // If it's a local fallback image
    if (data.image_url?.startsWith('/lovable-uploads/') || !data.image_url) {
      const imageUrl = data.image_url || getDefaultImage(data.title);
      
      updateGoalInState({
        id: goalId,
        image_url: imageUrl,
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
