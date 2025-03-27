
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { Task } from "@/hooks/useTasks";

interface GoalCardContentProps {
  taskSummary: string | null;
  tasksCount: number;
  isTasksLoading: boolean;
  onViewAllClick: (goalId: string) => void;
  goalId: string;
}

const GoalCardContent = ({
  taskSummary,
  tasksCount,
  isTasksLoading,
  onViewAllClick,
  goalId
}: GoalCardContentProps) => {
  return (
    <>
      {isTasksLoading ? (
        <div className="py-4 sm:py-6 flex justify-center">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          <div className="text-sm text-muted-foreground">
            {taskSummary ? (
              <p>{taskSummary}</p>
            ) : (
              <p>This goal has {tasksCount} tasks. Click on the goal title to view and manage all tasks.</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => onViewAllClick(goalId)}
          >
            View All Tasks <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
};

export default GoalCardContent;
