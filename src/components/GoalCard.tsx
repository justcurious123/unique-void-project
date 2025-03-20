
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mail, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/useGoals";
import type { Task } from "@/hooks/useTasks";
import { format } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  tasks: Task[];
  progress: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleTaskStatus: (taskId: string, completed: boolean) => Promise<boolean>;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  tasks,
  progress,
  isExpanded,
  onToggleExpand,
  onToggleTaskStatus
}) => {
  const formattedDate = goal.target_date 
    ? format(new Date(goal.target_date), "dd MMMM yyyy")
    : format(new Date(goal.created_at), "dd MMMM yyyy");

  return (
    <div className="flex flex-col h-full">
      <div 
        className={cn(
          "rounded-xl overflow-hidden flex flex-col h-full",
          goal.completed ? "bg-green-50" : "bg-primary"
        )}
      >
        {/* Card Header */}
        <div className="p-6 pb-4 text-white flex-grow flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-medium text-lg mb-2">{goal.title}</h3>
          
          {/* Progress Bar */}
          <div className="w-full mt-2">
            <Progress 
              value={progress} 
              className="h-1.5 bg-white/20"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-white/90">{progress}/100</span>
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-white hover:bg-white/90 text-primary"
              onClick={onToggleExpand}
            >
              {isExpanded ? "Hide details" : "See details"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Expandable Task List */}
      {isExpanded && (
        <div className="mt-4 bg-white rounded-xl border p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {goal.completed ? "Completed" : "Done"} on {formattedDate}
            </p>
          </div>
          
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-grow border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {task.completed ? (
                          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Current task</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                            <span>To do</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => onToggleTaskStatus(task.id, !task.completed)}
                    >
                      {task.completed ? "Done" : "Finish"}
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs p-0 h-auto flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      onClick={() => {}} // TODO: Implement expand/collapse for task details
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCard;
