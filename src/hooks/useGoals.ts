
import { useState, useEffect } from 'react';
import { Goal, NewGoal } from './types/goalTypes';
import { fetchUserGoals, createUserGoal, deleteUserGoal } from '@/services/goalService';
import { handleGoalImagesPreloading } from '@/utils/goalImageManager';

export type { Goal, NewGoal } from './types/goalTypes';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateGoalInState = (goalUpdate: Partial<Goal> & { id: string }) => {
    setGoals(prev => prev.map((g) => 
      g.id === goalUpdate.id ? { ...g, ...goalUpdate } : g
    ));
  };

  const refreshGoals = async () => {
    setIsLoading(true);
    try {
      const fetchedGoals = await fetchUserGoals();
      setGoals(fetchedGoals);
      
      // Handle image preloading for newly fetched goals
      if (fetchedGoals.length > 0) {
        handleGoalImagesPreloading(fetchedGoals, updateGoalInState);
      }
    } catch (error) {
      console.error("Error in refreshGoals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (newGoalData: NewGoal) => {
    const createdGoal = await createUserGoal(newGoalData);
    
    if (createdGoal) {
      // Update the local state with the new goal
      setGoals(prevGoals => [createdGoal, ...prevGoals]);
      
      // Start image preloading for this goal
      handleGoalImagesPreloading([createdGoal], updateGoalInState);
    }
    
    return createdGoal;
  };

  const deleteGoal = async (goalId: string) => {
    const success = await deleteUserGoal(goalId);
    
    if (success) {
      setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
    }
    
    return success;
  };

  useEffect(() => {
    refreshGoals();
  }, []);

  return {
    goals,
    isLoading,
    createGoal,
    deleteGoal,
    refreshGoals,
    updateGoalInState
  };
};
