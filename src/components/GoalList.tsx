
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

  if (goals.length === 0) {
    return (
      <Card className="mb-8 border-dashed">
        <CardContent className="pt-6 flex flex-col items-center text-center p-12">
          <Flag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Financial Goals Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by creating your first financial goal. Break it down into tasks and track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {goals.map((goal) => (
        <Collapsible
          key={goal.id}
          open={expandedGoalId === goal.id}
          onOpenChange={() => onExpandGoal(goal.id)}
        >
          <Card className={goal.completed ? "border-green-200 bg-green-50/30" : ""}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {goal.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {goal.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5">{goal.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => onDeleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      aria-expanded={expandedGoalId === goal.id}
                    >
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedGoalId === goal.id ? "rotate-180" : ""
                        )} 
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">
                  {expandedGoalId === goal.id ? `${calculateProgress(goal.id)}%` : ''}
                </span>
              </div>
              <Progress value={calculateProgress(goal.id)} className="h-2" />
            </CardContent>

            <CollapsibleContent>
              <CardContent className="pt-0">
                {isTasksLoading ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No tasks created for this goal yet.
                  </div>
                ) : activeQuizTaskId ? (
                  <div className="mt-4">
                    <TaskQuiz 
                      taskId={activeQuizTaskId} 
                      onClose={() => setActiveQuizTaskId(null)} 
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-medium">Tasks</h3>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border">
                          <Checkbox 
                            id={`task-${task.id}`} 
                            checked={task.completed}
                            onCheckedChange={(checked) => {
                              if (typeof checked === 'boolean') {
                                onUpdateTaskStatus(task.id, checked);
                              }
                            }}
                          />
                          <div className="flex-1 space-y-1">
                            <label 
                              htmlFor={`task-${task.id}`}
                              className={cn(
                                "font-medium cursor-pointer",
                                task.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </label>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent any default behavior
                              e.stopPropagation(); // Stop event propagation
                              setActiveQuizTaskId(task.id);
                            }}
                            type="button" // Explicitly set button type
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Quiz</span>
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
      ))}
    </div>
  );
};
