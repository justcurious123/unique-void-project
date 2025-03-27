
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/types/goalTypes";
import type { Task } from "@/hooks/useTasks";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import GoalCardImage from './goal-card/GoalCardImage';
import GoalCardHeader from './goal-card/GoalCardHeader';
import GoalCardProgress from './goal-card/GoalCardProgress';
import GoalCardContent from './goal-card/GoalCardContent';

interface GoalCardProps {
  goal: Goal;
  isExpanded: boolean;
  progressValue: number;
  onExpandGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  tasks: Task[];
  isTasksLoading: boolean;
  handleGoalTitleClick: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isExpanded,
  progressValue,
  onExpandGoal,
  onDeleteGoal,
  tasks,
  isTasksLoading,
  handleGoalTitleClick
}) => {
  return (
    <Collapsible
      key={goal.id}
      open={isExpanded}
      onOpenChange={() => onExpandGoal(goal.id)}
    >
      <Card className={cn(
        goal.completed ? "border-green-200 bg-green-50/30" : "",
        "overflow-hidden"
      )}>
        <GoalCardImage 
          imageUrl={goal.image_url}
          title={goal.title}
          goalId={goal.id}
          isLoading={goal.image_loading === true}
        />
        
        <CardHeader className={cn(
          "pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-5",
          "relative z-10 -mt-6"
        )}>
          <GoalCardHeader 
            title={goal.title}
            description={goal.description}
            isCompleted={goal.completed}
            isExpanded={isExpanded}
            goalId={goal.id}
            onDelete={onDeleteGoal}
            onTitleClick={handleGoalTitleClick}
          />
        </CardHeader>
        
        <CardContent className="pb-3 px-3 sm:px-6">
          <GoalCardProgress progressValue={progressValue} />
        </CardContent>

        <CollapsibleContent>
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-5">
            <GoalCardContent 
              taskSummary={goal.task_summary}
              tasksCount={tasks.length}
              isTasksLoading={isTasksLoading}
              onViewAllClick={handleGoalTitleClick}
              goalId={goal.id}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default GoalCard;
