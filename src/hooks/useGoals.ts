
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDefaultImage, preloadGoalImage, applyImagePropertiesToGoals, validateImageUrl } from "@/utils/goalImages";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  task_summary?: string;
  image_url?: string;
  image_loading?: boolean;
  image_error?: boolean;
}

export interface NewGoal {
  title: string;
  description: string;
  target_date: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please log in to view your goals");
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Initialize image loading states
      const goalsWithImageState = applyImagePropertiesToGoals(data || []);
      
      setGoals(goalsWithImageState);
      
      // Preload images to verify they exist
      if (goalsWithImageState.length > 0) {
        goalsWithImageState.forEach((goal) => {
          if (goal.image_loading) {
            preloadGoalImage(
              goal,
              // On success
              (goalId) => {
                setGoals(prev => prev.map((g) => 
                  g.id === goalId ? { ...g, image_loading: false } : g
                ));
              },
              // On error
              (goalId, defaultImg) => {
                // Update in the database too, to avoid future errors
                // Fix: Properly handle the Promise by using async/await or a proper Promise chain
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

                setGoals(prev => prev.map((g) => 
                  g.id === goalId ? { 
                    ...g, 
                    image_loading: false, 
                    image_error: false,
                    image_url: defaultImg
                  } : g
                ));
              }
            );
          }
        });
      }
    } catch (error: any) {
      toast.error(`Error fetching goals: ${error.message}`);
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (newGoal: { title: string; description: string; target_date: string }) => {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session.session) {
        toast.error("You must be logged in to create goals");
        return null;
      }
      
      const userId = session.session.user.id;
      
      // Assign a default image initially
      const defaultImageUrl = getDefaultImage(newGoal.title);
      
      // Only include properties that exist in the database table
      const goalData = {
        title: newGoal.title,
        description: newGoal.description,
        target_date: newGoal.target_date,
        user_id: userId,
        completed: false,
        image_url: defaultImageUrl
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select();
        
      if (error) {
        console.error('Database error creating goal:', error);
        throw error;
      }
      
      if (data) {
        // Initialize new goals with image states
        const newGoalsWithState = data.map(goal => ({
          ...goal,
          image_loading: true, // We're going to generate an image
          image_error: false
        }));
        
        setGoals([...newGoalsWithState, ...goals]);
        
        // Update the database with image_loading state - Use separate DB update
        // to avoid TypeScript issues with the column
        try {
          // Use a raw query with SQL parameters to set image_loading
          const { error: updateError } = await supabase.rpc(
            'update_goal_image_loading',
            { goal_id: data[0].id, is_loading: true }
          );
          
          if (updateError) {
            console.error('Failed to update image_loading state:', updateError);
          }
        } catch (updateError) {
          console.error('Failed to update image_loading state:', updateError);
        }
        
        return data[0];
      }
      return null;
    } catch (error: any) {
      console.error('Error creating goal:', error.message);
      toast.error(`Error creating goal: ${error.message}`);
      return null;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
        
      if (error) throw error;
      
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success("Goal deleted successfully");
      return true;
    } catch (error: any) {
      toast.error(`Error deleting goal: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    isLoading,
    createGoal,
    deleteGoal,
    refreshGoals: fetchGoals
  };
};
