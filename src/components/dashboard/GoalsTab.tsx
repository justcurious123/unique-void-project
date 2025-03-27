
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
  
  // Track which goals have their images loaded
  const [loadedGoalImages, setLoadedGoalImages] = useState<Set<string>>(new Set());

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

  // Check database for image status and force refresh if needed
  const refreshGoalImage = useCallback(async (goalId: string) => {
    try {
      // Skip if we've already loaded this goal's image
      if (loadedGoalImages.has(goalId)) {
        return;
      }

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
        // Check if the image is from Replicate (needs special handling)
        const isReplicateImage = data.image_url.includes('replicate.delivery');
        
        // Only force refresh for Replicate images that are marked as ready in the database
        if (isReplicateImage && !data.image_loading) {
          console.log(`Refreshing image for goal ${goalId}`);
          
          // Update local state with force refresh flag
          updateGoalInState({ 
            id: goalId, 
            image_url: data.image_url,
            image_loading: false,
            image_refresh: true
          });
          
          // Mark as loaded to prevent further refreshes
          setLoadedGoalImages(prev => new Set(prev).add(goalId));
        } 
        // For non-Replicate images or still loading images, just update state
        else if (!isReplicateImage) {
          updateGoalInState({ 
            id: goalId, 
            image_url: data.image_url,
            image_loading: data.image_loading
          });
          
          // Mark non-Replicate images as loaded
          if (!data.image_loading) {
            setLoadedGoalImages(prev => new Set(prev).add(goalId));
          }
        }
      }
    } catch (err) {
      console.error(`Error refreshing goal image: ${err}`);
    }
  }, [updateGoalInState, loadedGoalImages]);

  // Aggressively poll for newly created goals to get their images
  useEffect(() => {
    if (!recentlyCreatedGoalId) return;
    
    console.log(`Polling for new goal image: ${recentlyCreatedGoalId}`);
    let pollCount = 0;
    const maxPolls = 10;
    
    const pollInterval = setInterval(async () => {
      // If we've reached max polls or the image is loaded, stop polling
      if (pollCount >= maxPolls || loadedGoalImages.has(recentlyCreatedGoalId)) {
        clearInterval(pollInterval);
        setRecentlyCreatedGoalId(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('image_url, image_loading')
          .eq('id', recentlyCreatedGoalId)
          .single();
          
        if (error) {
          console.error(`Error polling for goal image: ${error.message}`);
        } else if (data && !data.image_loading && data.image_url) {
          console.log(`Found image for new goal: ${data.image_url}`);
          
          // If the image is from Replicate, force a refresh
          if (data.image_url.includes('replicate.delivery')) {
            updateGoalInState({ 
              id: recentlyCreatedGoalId, 
              image_url: data.image_url,
              image_loading: false,
              image_refresh: true
            });
            
            // Mark as loaded to stop further refreshes
            setLoadedGoalImages(prev => new Set(prev).add(recentlyCreatedGoalId));
            clearInterval(pollInterval);
            setRecentlyCreatedGoalId(null);
          }
        }
      } catch (err) {
        console.error(`Error polling for goal image: ${err}`);
      }
      
      pollCount++;
    }, 2000);
    
    // Clean up
    return () => clearInterval(pollInterval);
  }, [recentlyCreatedGoalId, loadedGoalImages, updateGoalInState]);

  // On mount, check images for all goals with loading state
  useEffect(() => {
    const loadingGoals = goals.filter(goal => 
      goal.image_loading === true && !loadedGoalImages.has(goal.id)
    );
    
    for (const goal of loadingGoals) {
      refreshGoalImage(goal.id);
    }
  }, [goals, refreshGoalImage, loadedGoalImages]);

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
    setRecentlyCreatedGoalId(goalId);
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
