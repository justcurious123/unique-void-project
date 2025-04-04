
import React, { useState, useEffect } from "react";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import CreateGoalDialog from "./CreateGoalDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLimits } from "@/hooks/useLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GoalsTab = () => {
  const navigate = useNavigate();
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});
  
  const { usageData } = useSubscription();
  const { goalLimitReached } = useLimits(usageData);
  
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
    // Navigate to goal detail page instead of expanding
    navigate(`/goal/${goalId}`);
    toast.info("Your goal is being generated with AI-powered tasks and quizzes. Please wait a moment...");
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {goalLimitReached && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              You've reached your goal creation limit on your current plan.
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      )}
      
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
