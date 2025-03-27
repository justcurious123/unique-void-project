
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
  goals.forEach((goal) => {
    if (goal.image_loading) {
      preloadGoalImage(
        goal,
        // On success
        (goalId) => {
          updateGoalInState({ id: goalId, image_loading: false });
        },
        // On error
        (goalId, defaultImg) => {
          // Update in the database too, to avoid future errors
          const updateImageUrl = async () => {
            try {
              await supabase
                .from('goals')
                .update({ image_url: defaultImg })
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
  
  return {
    ...goalData,
    image_url: imageUrl,
    image_loading: !isLocalImage, // Only set loading true for non-local images
    image_error: false
  };
};
