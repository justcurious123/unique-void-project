
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

// Default goal images based on common financial goals
const DEFAULT_IMAGES = [
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
const getDefaultImage = (goalTitle: string): string => {
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
      const goalsWithImageState = (data || []).map(goal => {
        // Assign a default image if none exists or apply the existing one
        const imageUrl = goal.image_url || getDefaultImage(goal.title);
        
        return {
          ...goal,
          image_url: imageUrl,
          image_loading: true,
          image_error: false
        };
      });
      
      setGoals(goalsWithImageState);
      
      // Preload images to verify they exist
      if (goalsWithImageState.length > 0) {
        goalsWithImageState.forEach((goal) => {
          if (goal.image_url) {
            const img = new Image();
            img.onload = () => {
              setGoals(prev => prev.map((g) => 
                g.id === goal.id ? { ...g, image_loading: false } : g
              ));
            };
            img.onerror = () => {
              console.error(`Failed to load image for goal: ${goal.title}`);
              // If the Supabase image fails, use our default image instead
              const defaultImg = getDefaultImage(goal.title);
              setGoals(prev => prev.map((g) => 
                g.id === goal.id ? { 
                  ...g, 
                  image_loading: false, 
                  image_error: false,
                  image_url: defaultImg
                } : g
              ));
            };
            img.src = goal.image_url;
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
      
      const { data, error } = await supabase
        .from('goals')
        .insert([
          { 
            title: newGoal.title,
            description: newGoal.description,
            target_date: newGoal.target_date,
            user_id: userId,
            completed: false,
            image_url: defaultImageUrl // Set a default image
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        // Initialize new goals with image states
        const newGoalsWithState = data.map(goal => ({
          ...goal,
          image_loading: false,
          image_error: false
        }));
        
        setGoals([...newGoalsWithState, ...goals]);
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
