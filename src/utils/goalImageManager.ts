
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/hooks/types/goalTypes";
import { getDefaultImage, preloadGoalImage, validateImageUrl } from "@/utils/goalImages";

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
      } as {
        goal_id: string;
        is_loading: boolean;
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
 * Handles image preloading for goals, updating loading states as needed
 */
export const handleGoalImagesPreloading = (
  goals: Goal[], 
  updateGoalInState: (goalUpdate: Partial<Goal> & { id: string }) => void
): void => {
  goals.forEach(async (goal) => {
    // For goals with Replicate images that are still loading, check the database
    if (goal.image_loading && goal.image_url?.includes('replicate.delivery')) {
      // Check if the goal image is actually ready in the database
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('image_url, image_loading')
          .eq('id', goal.id)
          .single();
          
        if (error) {
          console.error(`Error checking goal image status: ${error.message}`);
        } else if (data && !data.image_loading) {
          // The server thinks the image is ready, update our local state with force refresh
          console.log(`Database indicates image is ready for goal: ${goal.id}`);
          updateGoalInState({
            id: goal.id,
            image_loading: false,
            image_url: `${data.image_url}?force=${Date.now()}`,
            image_refresh: true
          });
          
          // Since we already know the image is ready according to the database,
          // no need to continue with preloading
          return;
        }
      } catch (error) {
        console.error(`Error checking image status in database: ${error}`);
      }
    }
    
    // Skip goals without an image URL or those using local fallback images
    if (!goal.image_url) {
      updateGoalInState({ 
        id: goal.id, 
        image_loading: false,
        image_error: false,
        image_url: getDefaultImage(goal.title)
      });
      return;
    }
    
    if (goal.image_url.startsWith('/lovable-uploads/')) {
      // For local images, just mark as non-loading
      updateGoalInState({ 
        id: goal.id, 
        image_loading: false, 
        image_error: false 
      });
      return;
    }
    
    // For remote URLs (like those from Replicate), preload only if marked as loading
    if (goal.image_loading) {
      console.log(`Preloading image for goal: ${goal.id} with URL: ${goal.image_url}`);
      
      preloadGoalImage(
        goal,
        // On success
        (goalId) => {
          console.log(`Image loaded successfully for goal: ${goalId}`);
          updateGoalInState({ 
            id: goalId, 
            image_loading: false,
            image_error: false,
            image_refresh: true
          });
          
          // Also update the database
          updateGoalImageLoadingState(goalId, false);
        },
        // On error
        (goalId, defaultImg) => {
          console.log(`Image failed to load for goal: ${goalId}, using default: ${defaultImg}`);
          
          // Update in the database too, to avoid future errors
          const updateImageUrl = async () => {
            try {
              await supabase
                .from('goals')
                .update({ 
                  image_url: defaultImg,
                  image_loading: false
                })
                .eq('id', goalId);
              console.log(`Updated goal ${goalId} with default image after load failure`);
            } catch (err) {
              console.error('Failed to update goal with default image:', err);
            }
          };
          
          // Execute the async function
          updateImageUrl();

          updateGoalInState({ 
            id: goalId, 
            image_loading: false, 
            image_error: false,
            image_url: defaultImg
          });
        }
      );
    }
  });
};

/**
 * Initializes a new goal with image state
 */
export const initializeGoalWithImage = (goalData: any): Goal => {
  // Assign a default image if none exists
  const imageUrl = goalData.image_url || getDefaultImage(goalData.title);
  
  // For explicitly local URLs (from our public dir), mark as non-loading
  const isLocalImage = imageUrl && imageUrl.startsWith('/lovable-uploads/');
  
  // For non-local images, ensure we force a cache-busting parameter
  const finalImageUrl = isLocalImage 
    ? imageUrl
    : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  
  return {
    ...goalData,
    image_url: finalImageUrl,
    image_loading: goalData.image_loading === null ? !isLocalImage : goalData.image_loading, // Only set loading true for non-local images
    image_error: false,
    image_refresh: false
  };
};
