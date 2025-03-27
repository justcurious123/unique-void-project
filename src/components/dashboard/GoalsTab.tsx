
import React, { useState, useEffect, useCallback } from "react";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import CreateGoalDialog from "./CreateGoalDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GoalsTab = () => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});
  const [recentlyCreatedGoalId, setRecentlyCreatedGoalId] = useState<string | null>(null);

  const {
    goals,
    createGoal,
    deleteGoal,
    refreshGoals,
    updateGoalInState
  } = useGoals();
  
  const {
    tasks,
    isLoading: isTasksLoading,
    fetchTasks,
    updateTaskStatus,
    createTask
  } = useTasks(expandedGoalId || "");

  useEffect(() => {
    if (expandedGoalId && tasks.length > 0) {
      setGoalTasksCache(prev => ({
        ...prev,
        [expandedGoalId]: tasks
      }));
    }
  }, [expandedGoalId, tasks]);

  // Force refresh specific goal image
  const refreshGoalImage = useCallback(async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('image_url, image_loading')
        .eq('id', goalId)
        .single();
        
      if (error) {
        console.error(`Error checking goal image status: ${error.message}`);
        return;
      }
      
      if (data && data.image_url) {
        console.log(`Forcing refresh for goal ${goalId} with image: ${data.image_url}`);
        
        // Update local state with force refresh flag
        updateGoalInState({ 
          id: goalId, 
          image_url: `${data.image_url}?force=${Date.now()}`,
          image_loading: false,
          image_refresh: true // New flag to trigger refresh in components
        });
      }
    } catch (err) {
      console.error(`Error refreshing goal image: ${err}`);
    }
  }, [updateGoalInState]);

  // Aggressive polling for the most recently created goal
  useEffect(() => {
    if (!recentlyCreatedGoalId) return;
    
    console.log(`Setting up aggressive polling for new goal: ${recentlyCreatedGoalId}`);
    
    // Initial check after short delay
    const initialCheck = setTimeout(() => {
      refreshGoalImage(recentlyCreatedGoalId);
    }, 1000);
    
    // Set up more frequent polling specifically for the new goal
    const aggressiveInterval = setInterval(() => {
      refreshGoalImage(recentlyCreatedGoalId);
    }, 2000);
    
    // Clear the aggressive polling after 30 seconds
    const clearAggressive = setTimeout(() => {
      console.log(`Ending aggressive polling for goal: ${recentlyCreatedGoalId}`);
      setRecentlyCreatedGoalId(null);
    }, 30000);
    
    return () => {
      clearTimeout(initialCheck);
      clearInterval(aggressiveInterval);
      clearTimeout(clearAggressive);
    };
  }, [recentlyCreatedGoalId, refreshGoalImage]);

  // Regular polling for all goals with loading images
  useEffect(() => {
    const loadingGoals = goals.filter(goal => goal.image_loading);
    
    if (loadingGoals.length === 0) return;
    
    console.log(`Regular polling for ${loadingGoals.length} goals with loading images`);
    
    // Set up polling for image updates
    const pollInterval = setInterval(async () => {
      let shouldRefresh = false;
      
      for (const goal of loadingGoals) {
        if (!goal.image_loading) continue;
        
        try {
          console.log(`Checking image status for goal: ${goal.id}`);
          const { data, error } = await supabase
            .from('goals')
            .select('image_url, image_loading')
            .eq('id', goal.id)
            .single();
            
          if (error) {
            console.error(`Error checking goal image status: ${error.message}`);
            continue;
          }
          
          if (data && !data.image_loading && data.image_url && !data.image_url.startsWith('/lovable-uploads/')) {
            console.log(`Image ready for goal ${goal.id}: ${data.image_url}`);
            
            // Force refresh image with new cache busting
            const refreshedUrl = `${data.image_url}?force=${Date.now()}`;
            
            // Update the goal in local state
            updateGoalInState({ 
              id: goal.id, 
              image_url: refreshedUrl,
              image_loading: false,
              image_refresh: true
            });
            
            shouldRefresh = true;
          }
        } catch (err) {
          console.error(`Error polling for goal image: ${err}`);
        }
      }
      
      // If any images were updated, we might want to refresh the goal list
      if (shouldRefresh) {
        console.log('Some images were updated, refreshing goals');
      }
    }, 3000); // Regular check every 3 seconds
    
    return () => clearInterval(pollInterval);
  }, [goals, updateGoalInState]);

  // Check for any Replicate images that are still loading
  useEffect(() => {
    const checkReplicateImages = async () => {
      for (const goal of goals) {
        // If the goal has a Replicate image URL and is marked as loading
        if (goal.image_url?.includes('replicate.delivery') && goal.image_loading) {
          console.log(`Checking Replicate image for goal: ${goal.id}`);
          
          try {
            // Try to preload the image
            const img = new Image();
            const cacheKey = `${Date.now()}`;
            img.src = `${goal.image_url}?t=${cacheKey}`;
            
            img.onload = () => {
              console.log(`Replicate image loaded for goal: ${goal.id}`);
              // Update the goal's loading state in local state
              updateGoalInState({ 
                id: goal.id, 
                image_loading: false,
                image_url: `${goal.image_url}?t=${cacheKey}`,
                image_refresh: true
              });
            };
            
            // Set a timeout to mark as non-loading after timeout
            setTimeout(() => {
              if (goal.image_loading) {
                console.log(`Timeout waiting for image: ${goal.id}`);
                updateGoalInState({ 
                  id: goal.id, 
                  image_loading: false
                });
              }
            }, 5000);
          } catch (err) {
            console.error(`Error checking image for goal ${goal.id}:`, err);
            updateGoalInState({ 
              id: goal.id, 
              image_loading: false
            });
          }
        }
      }
    };
    
    if (goals.length > 0) {
      checkReplicateImages();
    }
  }, [goals, updateGoalInState]);

  const toggleGoalExpand = async (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
    }
  };

  const calculateGoalProgress = (goalId: string) => {
    const cachedTasks = goalTasksCache[goalId] || [];
    const goalTasks = expandedGoalId === goalId ? tasks : cachedTasks;
    if (goalTasks.length === 0) {
      return 0;
    }
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round(completedTasks / goalTasks.length * 100);
  };

  const handleGoalCreated = (goalId: string) => {
    setExpandedGoalId(goalId);
    setRecentlyCreatedGoalId(goalId); // Track newly created goal for aggressive polling
    // Show a message about the image
    toast.info("Your goal image is being generated and will appear shortly");
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Goals</h2>
          <CreateGoalDialog
            onCreateGoal={createGoal}
            onGoalCreated={handleGoalCreated}
            refreshGoals={refreshGoals}
            createTask={createTask}
            fetchTasks={fetchTasks}
          />
        </div>

        <GoalList 
          goals={goals} 
          expandedGoalId={expandedGoalId} 
          onExpandGoal={toggleGoalExpand} 
          onDeleteGoal={deleteGoal} 
          calculateProgress={calculateGoalProgress} 
          tasks={tasks} 
          isTasksLoading={isTasksLoading} 
          onUpdateTaskStatus={updateTaskStatus} 
        />
      </div>
    </div>
  );
};

export default GoalsTab;
