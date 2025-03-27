
import { supabase } from "@/integrations/supabase/client";
import { Goal, NewGoal } from "@/hooks/types/goalTypes";
import { toast } from "sonner";
import { initializeGoalWithImage, updateGoalImageLoadingState } from "@/utils/goalImageManager";

/**
 * Fetches all goals for the current user
 */
export const fetchUserGoals = async (): Promise<Goal[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast.error("Please log in to view your goals");
      return [];
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Return goals with image state initialized
    return data ? data.map(goal => initializeGoalWithImage(goal)) : [];
  } catch (error: any) {
    toast.error(`Error fetching goals: ${error.message}`);
    console.error("Error fetching goals:", error);
    return [];
  }
};

/**
 * Creates a new goal for the current user
 */
export const createUserGoal = async (newGoal: NewGoal): Promise<Goal | null> => {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session.session) {
      toast.error("You must be logged in to create goals");
      return null;
    }
    
    const userId = session.session.user.id;
    
    // Only include properties that exist in the database table
    const goalData = {
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
      user_id: userId,
      completed: false,
      image_loading: true // Start with loading true so we trigger the AI image generation
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select();
      
    if (error) {
      console.error('Database error creating goal:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Initialize new goal with image states
    const newGoalWithState = initializeGoalWithImage(data[0]);
    
    // Update the database with image_loading state explicitly
    await updateGoalImageLoadingState(data[0].id, true);
    
    return newGoalWithState;
  } catch (error: any) {
    console.error('Error creating goal:', error.message);
    toast.error(`Error creating goal: ${error.message}`);
    return null;
  }
};

/**
 * Deletes a goal by ID
 */
export const deleteUserGoal = async (goalId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);
      
    if (error) throw error;
    
    toast.success("Goal deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Error deleting goal: ${error.message}`);
    return false;
  }
};
