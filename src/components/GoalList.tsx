
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, ChevronDown, CheckCircle, Flag, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/useGoals";
import type { Task } from "@/hooks/useTasks";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import TaskQuiz from './TaskQuiz';
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <div className="grid gap-4 sm:gap-6">
      {goals.map((goal) => {
        // Calculate progress once for each goal to ensure consistency
        const progressValue = calculateProgress(goal.id);
        
        return (
          <Collapsible
            key={goal.id}
            open={expandedGoalId === goal.id}
            onOpenChange={() => onExpandGoal(goal.id)}
          >
            <Card className={goal.completed ? "border-green-200 bg-green-50/30" : ""}>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
                      {goal.completed && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                      {goal.title}
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
                  ) : tasks.length === 0 ? (
                    <div className="py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground">
                      No tasks created for this goal yet.
                    </div>
                  ) : activeQuizTaskId ? (
                    <div className="mt-3 sm:mt-4">
                      <TaskQuiz 
                        taskId={activeQuizTaskId} 
                        onClose={() => setActiveQuizTaskId(null)} 
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-medium text-sm sm:text-base">Tasks</h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-md border">
                            <Checkbox 
                              id={`task-${task.id}`} 
                              checked={task.completed}
                              onCheckedChange={(checked) => {
                                if (typeof checked === 'boolean') {
                                  onUpdateTaskStatus(task.id, checked);
                                }
                              }}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-0.5 sm:space-y-1">
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={cn(
                                  "font-medium cursor-pointer text-xs sm:text-sm",
                                  task.completed && "line-through text-muted-foreground"
                                )}
                              >
                                {task.title}
                              </label>
                              {task.description && (
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 h-7 text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveQuizTaskId(task.id);
                              }}
                              type="button"
                            >
                              <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className={isMobile ? "sr-only" : ""}>Quiz</span>
                            </Button>
                          </div>
                        ))}
                      </div>
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
