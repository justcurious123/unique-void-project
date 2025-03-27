
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, ChevronDown, CheckCircle, Loader2, ExternalLink, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/hooks/types/goalTypes";
import type { Task } from "@/hooks/useTasks";
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { Collapsible } from "@/components/ui/collapsible";
import { getDefaultImage } from "@/utils/goalImages";

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
  const [imageRetries, setImageRetries] = useState<number>(0);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const isImageLoading = goal.image_loading === true;
  const hasImage = !!goal.image_url;
  const retryKey = `${goal.id}-${imageRetries}`;

  // Handle image load errors
  const handleImageError = () => {
    console.log(`Image failed to load for goal: ${goal.id}, attempting retry or fallback`);
    if (imageRetries < 2) {
      // Try a couple of times with the original URL
      setImageRetries(prev => prev + 1);
    } else {
      // After retries, use fallback image
      setUseFallback(true);
    }
  };

  // Get the appropriate image URL to display
  const getImageUrl = () => {
    if (useFallback || !goal.image_url) {
      return getDefaultImage(goal.title);
    }
    return `${goal.image_url}?key=${retryKey}`;
  };

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
        {/* Image Section - Fixed to always show and properly handle loading state */}
        <div className="relative w-full h-24 bg-slate-100">
          {isImageLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div 
              className="relative w-full h-24 bg-cover bg-center" 
              style={{
                backgroundImage: `url(${getImageUrl()})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
              <img 
                src={getImageUrl()}
                alt=""
                className="hidden" // Hidden image used for error detection
                onError={handleImageError}
              />
            </div>
          )}
        </div>
        
        <CardHeader className={cn(
          "pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-5",
          !isImageLoading ? "relative z-10 -mt-6" : ""
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
                  aria-expanded={isExpanded}
                  className="h-7 w-7 sm:h-8 sm:w-8"
                >
                  <ChevronDown 
                    className={cn(
                      "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200",
                      isExpanded ? "rotate-180" : ""
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
};

export default GoalCard;
