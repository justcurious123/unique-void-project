import React, { useState, useEffect } from "react";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import CreateGoalDialog from "./CreateGoalDialog";

const GoalsTab = () => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});

  const {
    goals,
    createGoal,
    deleteGoal,
    refreshGoals
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
