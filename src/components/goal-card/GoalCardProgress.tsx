
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface GoalCardProgressProps {
  progressValue: number;
}

const GoalCardProgress = ({ progressValue }: GoalCardProgressProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium">Progress</span>
        <span className="text-xs sm:text-sm">
          {progressValue}%
        </span>
      </div>
      <Progress value={progressValue} className="h-1.5 sm:h-2" />
    </div>
  );
};

export default GoalCardProgress;
