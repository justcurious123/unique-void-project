
import React, { useState, useEffect } from "react";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import CreateGoalDialog from "./CreateGoalDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GoalsTab = () => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});

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

  // Poll for image updates for recently created goals
  useEffect(() => {
    const newlyCreatedGoals = goals.filter(goal => goal.image_loading);
    
    if (newlyCreatedGoals.length === 0) return;
    
    // Set up polling for image updates
    const pollInterval = setInterval(async () => {
      let shouldRefresh = false;
      
      for (const goal of newlyCreatedGoals) {
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
            // Update the goal in local state
            updateGoalInState({ 
              id: goal.id, 
              image_url: data.image_url,
              image_loading: false
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
    }, 2000); // Check every 2 seconds
    
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
                image_url: `${goal.image_url}?t=${cacheKey}`
              });
            };
            
            // Set a timeout to mark as non-loading after 10 seconds regardless
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
