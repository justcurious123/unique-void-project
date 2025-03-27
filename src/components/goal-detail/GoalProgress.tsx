
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CardContent } from '@/components/ui/card';

interface GoalProgressProps {
  progressValue: number;
  summary?: string;
}

const GoalProgress = ({ progressValue, summary }: GoalProgressProps) => {
  return (
    <CardContent>
      <div className="flex justify-between items-center mb-2">
        <span className="text-base sm:text-lg font-medium">Overall Progress</span>
        <span className="text-base sm:text-lg">{progressValue}%</span>
      </div>
      <Progress value={progressValue} className="h-3 mb-6" />
      
      {summary && (
        <div className="bg-muted/30 p-4 rounded-md mb-6">
          <h3 className="text-base sm:text-lg font-medium mb-2">Goal Summary</h3>
          <p className="text-sm sm:text-base text-muted-foreground">{summary}</p>
        </div>
      )}
    </CardContent>
  );
};

export default GoalProgress;
