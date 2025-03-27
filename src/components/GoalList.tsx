
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";
import type { Goal } from "@/hooks/types/goalTypes";
import type { Task } from "@/hooks/useTasks";
import GoalCard from "./GoalCard";
import { useNavigate } from "react-router-dom";

interface GoalListProps {
  goals: Goal[];
  expandedGoalId: string | null;
  onExpandGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  calculateProgress: (goalId: string) => number;
  tasks: Task[];
  isTasksLoading: boolean;
  onUpdateTaskStatus: (taskId: string, completed: boolean) => Promise<boolean>;
}

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  expandedGoalId,
  onExpandGoal,
  onDeleteGoal,
  calculateProgress,
  tasks,
  isTasksLoading,
  onUpdateTaskStatus
}) => {
  const navigate = useNavigate();
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const newProgressValues: Record<string, number> = {};
    goals.forEach(goal => {
      newProgressValues[goal.id] = calculateProgress(goal.id);
    });
    setProgressValues(newProgressValues);
  }, [goals, calculateProgress, tasks]);

  const handleGoalTitleClick = (goalId: string) => {
    navigate(`/goal/${goalId}`);
  };

  if (goals.length === 0) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="pt-6 flex flex-col items-center text-center p-8 sm:p-12">
          <Flag className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium mb-1 sm:mb-2">No Financial Goals Yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Start by creating your first financial goal. Break it down into tasks and track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          isExpanded={expandedGoalId === goal.id}
          progressValue={progressValues[goal.id] || 0}
          onExpandGoal={onExpandGoal}
          onDeleteGoal={onDeleteGoal}
          tasks={tasks}
          isTasksLoading={isTasksLoading}
          handleGoalTitleClick={handleGoalTitleClick}
        />
      ))}
    </div>
  );
};
