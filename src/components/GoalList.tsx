
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Goal } from "@/hooks/useGoals";
import type { Task } from "@/hooks/useTasks";
import GoalCard from './GoalCard';

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
  const [filterStatus, setFilterStatus] = useState<'active' | 'completed'>('active');
  
  const filteredGoals = goals.filter(goal => 
    filterStatus === 'active' ? !goal.completed : goal.completed
  );

  if (goals.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Financial Goals Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by creating your first financial goal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Tabs defaultValue="active" className="w-full max-w-xs" onValueChange={(value) => setFilterStatus(value as 'active' | 'completed')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const goalTasks = tasks.filter(task => expandedGoalId === goal.id);
          const progress = calculateProgress(goal.id);
          
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              tasks={goalTasks}
              progress={progress}
              isExpanded={expandedGoalId === goal.id}
              onToggleExpand={() => onExpandGoal(goal.id)}
              onToggleTaskStatus={onUpdateTaskStatus}
            />
          );
        })}
      </div>
      
      {filteredGoals.length === 0 && (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">
            No {filterStatus === 'active' ? 'active' : 'completed'} goals found
          </h3>
          <p className="text-muted-foreground mb-4">
            {filterStatus === 'active' 
              ? "Create a new goal or check your completed goals" 
              : "Complete some goals to see them here"}
          </p>
        </div>
      )}
    </div>
  );
};
