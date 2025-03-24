import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, ChevronDown, CheckCircle, Flag, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/useGoals";
import type { Task } from "@/hooks/useTasks";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const newProgressValues: Record<string, number> = {};
    goals.forEach(goal => {
      newProgressValues[goal.id] = calculateProgress(goal.id);
    });
    setProgressValues(newProgressValues);
  }, [goals, calculateProgress, tasks]);

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

  const handleGoalTitleClick = (goalId: string) => {
    navigate(`/goal/${goalId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {goals.map((goal) => {
        const progressValue = progressValues[goal.id] || 0;
        
        return (
          <Collapsible
            key={goal.id}
            open={expandedGoalId === goal.id}
            onOpenChange={() => onExpandGoal(goal.id)}
          >
            <Card className={cn(
              goal.completed ? "border-green-200 bg-green-50/30" : "",
              "overflow-hidden"
            )}>
              {goal.image_url && (
                <div 
                  className="relative w-full h-24 bg-cover bg-center" 
                  style={{
                    backgroundImage: `url(${goal.image_url})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
                </div>
              )}
              
              <CardHeader className={cn(
                "pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-5",
                goal.image_url ? "relative z-10 -mt-6" : ""
              )}>
                <div className="flex justify-between items-start">
                  <div onClick={() => handleGoalTitleClick(goal.id)} className="cursor-pointer">
                    <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg group">
                      {goal.completed && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                      <span>{goal.title}</span>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">{goal.description}</CardDescription>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="icon" onClick={() => onDeleteGoal(goal.id)} 
                      className="h-7 w-7 sm:h-8 sm:w-8">
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        aria-expanded={expandedGoalId === goal.id}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <ChevronDown 
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200",
                            expandedGoalId === goal.id ? "rotate-180" : ""
                          )} 
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 px-3 sm:px-6">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium">Progress</span>
                  <span className="text-xs sm:text-sm">
                    {progressValue}%
                  </span>
                </div>
                <Progress value={progressValue} className="h-1.5 sm:h-2" />
              </CardContent>

              <CollapsibleContent>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-5">
                  {isTasksLoading ? (
                    <div className="py-4 sm:py-6 flex justify-center">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {goal.task_summary ? (
                          <p>{goal.task_summary}</p>
                        ) : (
                          <p>This goal has {tasks.length} tasks. Click on the goal title to view and manage all tasks.</p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => handleGoalTitleClick(goal.id)}
                      >
                        View All Tasks <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};
