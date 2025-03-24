
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
      setGoals(data || []);
    } catch (error: any) {
      toast.error(`Error fetching goals: ${error.message}`);
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
      
      const { data, error } = await supabase
        .from('goals')
        .insert([
          { 
            title: newGoal.title,
            description: newGoal.description,
            target_date: newGoal.target_date,
            user_id: userId,
            completed: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setGoals([...goals, ...data]);
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
