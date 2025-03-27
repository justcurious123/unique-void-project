
import React from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollapsibleTrigger } from "@/components/ui/collapsible";

interface GoalCardHeaderProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isExpanded: boolean;
  goalId: string;
  onDelete: (goalId: string) => void;
  onTitleClick: (goalId: string) => void;
}

const GoalCardHeader = ({
  title,
  description,
  isCompleted,
  isExpanded,
  goalId,
  onDelete,
  onTitleClick
}: GoalCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div onClick={() => onTitleClick(goalId)} className="cursor-pointer">
        <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg group">
          {isCompleted && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
          <span>{title}</span>
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardTitle>
        <CardDescription className="mt-1 text-xs sm:text-sm">{description}</CardDescription>
      </div>
      <div className="flex gap-1 sm:gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onDelete(goalId)} 
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
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
  );
};

export default GoalCardHeader;
