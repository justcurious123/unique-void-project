
import React from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, ChevronDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/useGoals";

interface GoalListProps {
  goals: Goal[];
  expandedGoalId: string | null;
  onExpandGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  calculateProgress: (goalId: string) => number;
}

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  expandedGoalId,
  onExpandGoal,
  onDeleteGoal,
  calculateProgress
}) => {
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
        <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50/30" : ""}>
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onExpandGoal(goal.id)}
                  aria-expanded={expandedGoalId === goal.id}
                >
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedGoalId === goal.id ? "rotate-180" : ""
                    )} 
                  />
                </Button>
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
        </Card>
      ))}
    </div>
  );
};
